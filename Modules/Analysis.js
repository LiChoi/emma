
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
        if (foundMatch) { foundMatch.tradeName = drug.tradeName; drugs.push(foundMatch); } 
    });
    let DTPs = [];
    //Iterate over array of matching drug entries 
    drugs.forEach((drug, index)=>{
        //Within each loop, loop again over the remaining entries to check every possible pair of drugs
        for (let i = index + 1 ; i < drugs.length ; i++){
            //For each pair, loop across the first drug's interaction tags
            drug.interactionTags.forEach((tag)=>{
                //If a tag matches the drug being checked, then push the relevant information into the DTP (drug-therapy-problem) array
                if ( tag.tag == drugs[i].class || tag.tag == drugs[i].chemicalName ) {
                    DTPs.push(`Taking ${drug.tradeName} and ${drugs[i].tradeName} together. ${tag.effect}`);
                }
            });
        }
    });
    return DTPs;
}

const CheckForAllergies = (allergies, medlist, compendium) => {
    //In All Cases: drug can be listed as chemical or trade name -> find compendium entry and work with chemical name
    //Scenario: allergy listed as tradeName or chemicalName, and drug chemical matches --> find compendium entry and work with chemical names
    //Scenario: allergy can be listed as chemical or trade name, drug chemical doesn't match but drug class matches --> compare class of both entries
    //Scenario: allergy listed as class name and drug class matches --> use drug compendium entry to find its class and match to the listed allergy
    let allergiesFound = [];
    medlist.forEach((drug)=>{
        let drugEntry = FindCompendiumEntry(drug.tradeName, compendium);
        allergies.forEach((allergy)=> {
            let allergyEntry = FindCompendiumEntry(allergy.name, compendium);
            if ( drugEntry && ( ( allergyEntry && drugEntry.chemicalName == allergyEntry.chemicalName) || drugEntry.class == allergy.name || (allergyEntry && drugEntry.class == allergyEntry.class) ) ){
                allergiesFound.push(`Taking ${drug.tradeName} when allergic to ${allergy.name}. Potential cross-allergy: ${allergy.details}`);
            } 
        });
    });
    return allergiesFound;
}

const CheckForContraindications = (profile, compendium, medicalTerms) => {
    //Map profile conditions to primary medical terms
    //Check each drug's contraindications, see if matches array of primary medical terms  
    let conditions = profile.conditions.map((condition)=>{
        let matchedTerm = false;
        for(let i = 0; i < medicalTerms.length; i++){
            if ( medicalTerms[i].relatedTerms.indexOf(condition.name) !== -1 ) { matchedTerm = medicalTerms[i].primaryTerm; }
            if (matchedTerm){ i = medicalTerms.length; }
        }
        return matchedTerm ? matchedTerm : condition.name ; //If no match found, return condition as is. It'll simply be ignored in next step
    });
    let contraindicationsFound = [];
    profile.medlist.forEach((drug)=>{
        let entry = FindCompendiumEntry(drug.tradeName, compendium); 
        if (entry){
            entry.contraindications.forEach((CI)=>{
                let matchLocation = conditions.indexOf(CI);
                if (matchLocation !== -1){
                    contraindicationsFound.push(`Taking ${drug.tradeName} with condition: ${profile.conditions[matchLocation].name}`); //Profile.conditions because want to use same terminology that patint inputted, rather than the primary term
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
