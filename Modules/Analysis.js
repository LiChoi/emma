
export const PrepareReport = (profile, compendium, medicalTerms) => {
    let DTPs = CheckForInteractions(profile.medlist, compendium); //Returns array of {drug1: string, drug2: string, tag: tagObject}
    let allergies = CheckForAllergies(profile.allergies, profile.medlist, compendium);
    DTPs = allergies.length > 0 ? DTPs.concat(allergies) : DTPs;
    let contraindications = CheckForContraindications(profile, compendium, medicalTerms);
    DTPs = contraindications.length > 0 ? DTPs.concat(contraindications) : DTPs;
    return DTPs;
}

const CheckForInteractions = (medlist, compendium) => {
    //For each drug in medlist, get its corresponding Compendium entry, put into array
    let drugs = [];
    medlist.forEach((drug)=>{
        let foundMatch = FindCompendiumEntry(drug.tradeName, compendium);
        if (foundMatch) { foundMatch.tradeName = drug.tradeName; drugs.unshift(foundMatch); } //Move indentified drugs to front of array and unindentified to end to ensure known drugs get checked first. If check unidentitied drugs first, there will be no interactionTags, thus won't identify DI's, and if interaction exists with drug at end of array, that drug won't be checked against earlier drugs in array.
        else { foundMatch = {tradeName: drug.tradeName, chemicalName: drug.tradeName, class: "I don't know", interactionTags: ["Unknown"], tags: ['Unknown']}; drugs.push(foundMatch); } //If no corresponding entry, create an entry with dummy values and assume chemicalName=tradeName
    });
    let DTPs = [];
    //Iterate over array of matching drug entries 
    drugs.forEach((drug, index)=>{
        //Within each loop, loop again over the remaining entries to check every possible pair of drugs
        for (let i = index + 1 ; i < drugs.length ; i++){
            //For each pair, loop across the first drug's interaction tags
            drug.interactionTags.forEach((tag)=>{
                //If a tag matches the drug being checked, then push the relevant information into the DTP (drug-therapy-problem) array
                if ( tag.tag == drugs[i].class || tag.tag == drugs[i].chemicalName || drugs[i].tags.indexOf(tag.tag) !== -1 ) {
                    DTPs.push(`Taking ${drug.tradeName} and ${drugs[i].tradeName} together. ${tag.effect}`);
                }
            });
        }
    });
    return DTPs;
}

const CheckForAllergies = (allergies, medlist, compendium) => {
    let allergyCompendiumEntries = allergies.map((allergy)=>{
        let compendiumEntry = FindCompendiumEntry(allergy.name, compendium);
        compendiumEntry = compendiumEntry ? {...compendiumEntry} : { chemicalName: "?", tradeNames: ["?"], class: "?", crossAllergies: [allergy.name] }
        compendiumEntry.crossAllergies = [ compendiumEntry.chemicalName, ...compendiumEntry.tradeNames, compendiumEntry.class, ...compendiumEntry.crossAllergies];
        compendiumEntry.listedAllergy = allergy.name;
        compendiumEntry.listedAllergyDetails = allergy.details;
        return compendiumEntry;
    });
    let drugList = [];
    medlist.forEach((drug)=>{
        let foundMatch = FindCompendiumEntry(drug.tradeName, compendium);
        if (foundMatch) { foundMatch = {...foundMatch}; foundMatch.listedDrug = drug.tradeName; } 
        else { foundMatch = {listedDrug: drug.tradeName, chemicalName: "??", class: "??", tradeNames: ["??"], crossAllergies: [drug.tradeName]}; } //"??" won't match with "?"
        foundMatch.crossAllergies = [foundMatch.listedDrug, foundMatch.chemicalName, foundMatch.class, ...foundMatch.crossAllergies, ...foundMatch.tradeNames];
        drugList.push(foundMatch);
    });
    let allergiesFound = [];
    drugList.forEach((drug)=>{
        allergyCompendiumEntries.forEach((allergy)=>{
            for (let i = 0; i<allergy.crossAllergies.length; i++) {
                if (drug.crossAllergies.indexOf(allergy.crossAllergies[i]) !== -1 ) { allergiesFound.push(`Taking ${drug.listedDrug} when allergic to ${allergy.listedAllergy}. Potential cross-allergy. ${allergy.listedAllergyDetails}`); i = allergy.crossAllergies.length; }
            }
        });
    });
    return allergiesFound;
}

const CheckForContraindications = (profile, compendium, medicalTerms) => {
    let patientConditionsObject = {};
    profile.conditions.forEach((condition)=>{
        let matchedTerm = condition.name;
        for(let i = 0; i < medicalTerms.length; i++){
            if ( medicalTerms[i].relatedTerms.indexOf(condition.name) !== -1 ) { matchedTerm = medicalTerms[i].primaryTerm; }
            if (matchedTerm !== condition.name){ i = medicalTerms.length; }
        }
        patientConditionsObject[matchedTerm] = { originalTerm: condition.name, details: condition.details }
    });
    let contraindicationsFound = [];
    profile.medlist.forEach((drug)=>{
        let entry = FindCompendiumEntry(drug.tradeName, compendium); 
        if (entry){
            entry.contraindications.forEach((CI)=>{
                if (/age/.test(CI.tag) && /[<>=]/.test(CI.tag)) {
                    let age = CalculateAge(profile.birthday); //the expression in eval will call variable 'age', javascript can evaluate even if age is stored as string 
                    if (eval(CI.tag)) { contraindicationsFound.push(`Taking ${drug.tradeName} and ${CI.tag}. ${CI.details}`); }
                } else if (/crcl/.test(CI.tag) && /[<>=]/.test(CI.tag)) { 
                    if (patientConditionsObject.hasOwnProperty('Crcl')) {
                        let crcl = patientConditionsObject.Crcl.details; //the expression in eval will call variable crcl, javascript can evaluate even if crcl is stored as string  
                        if (eval(CI.tag)) { contraindicationsFound.push(`Taking ${drug.tradeName} while ${CI.tag}ml/min. ${CI.details}`); }
                    }
                } else {
                    if (patientConditionsObject.hasOwnProperty(CI.tag)){ contraindicationsFound.push(`Taking ${drug.tradeName} with condition of ${patientConditionsObject[CI.tag].originalTerm}. ${CI.details}`); }
                }
            });
        }
    });
    return contraindicationsFound;
}

const FindCompendiumEntry = (tradeName, compendium) => {
    let tagIndex = tradeName.indexOf('-');
    let untaggedTradeName = tradeName.slice(tagIndex + 1).toLowerCase();
    let tradeNameLC = tradeName.toLowerCase(); 
    let foundEntry = null;
    for(let i = 0; i < compendium.length; i++){
        if (compendium[i].chemicalName == tradeNameLC || compendium[i].chemicalName == untaggedTradeName ){
            foundEntry = compendium[i];
            i = compendium.length; 
        } else {
            for(let j = 0; j < compendium[i].tradeNames.length; j++){
                if (compendium[i].tradeNames[j].toLowerCase() == tradeNameLC) { 
                    foundEntry = compendium[i]; 
                    j = compendium[i].tradeNames.length;
                }
            }
            if (foundEntry) { i = compendium.length; } 
        }
    }
    return foundEntry;
}

export const CalculateAge = (birthday) => {
    let now = new Date(Date.now());
    return now.getFullYear() - birthday.getFullYear(); 
}