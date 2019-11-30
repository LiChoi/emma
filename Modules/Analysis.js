
export const PrepareReport = (medlist, compendium) => {
    let DTPs = CheckForDTPs(medlist, compendium); //Returns array of {drug1: string, drug2: string, tag: tagObject}
    return DTPs.map((DTP)=>{
        return `Taking ${DTP.drug1} and ${DTP.drug2} together. ${DTP.tag.effect}`;
    });
}

const CheckForDTPs = (medlist, compendium) => {
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
                    DTPs.push({drug1: drug.tradeName, drug2: drugs[i].tradeName, tag: tag});
                }
            });
        }
    });
    return DTPs;
}

const FindCompendiumEntry = (tradeName, compendium) => {
    let tagIndex = tradeName.indexOf('-');
    let untaggedTradeName = tradeName.slice(tagIndex + 1).toLowerCase();
    let tradeNameLC = tradeName.toLowerCase(); 
    let foundEntry = null;
    compendium.forEach((entry)=>{
        if (entry.chemicalName == tradeNameLC || entry.chemicalName == untaggedTradeName ){
            foundEntry = entry;
        } else {
            entry.tradeNames.forEach((tradeName)=>{ if (tradeNameLC == tradeName.toLowerCase()) { foundEntry = entry; } });
        }
    });
    return foundEntry;
}
