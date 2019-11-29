//const Realm = require('realm');
//module for checking for interactions 

export const CheckForDTPs = (data) => {
    //data.medlist
    //data.compendium 
    //For each drug in medlist, get its corresponding Compendium entry, put into array
    //Iterate over array of entries 
    //Within each loop, loop again over the remaining entries 
    //For each entry to check against, loop across index drug's interaction tags
    //If tagType is chemical name, then compare to the chemical name of that entry
    //if tagType is tradeName, then loop over the tradeNames of that entry
    //If tagType is class, then compare to the class of that entry 
    //For any match, append the appropriate message to the DTPs array 
    let DTPs = [];
    data.medlist.forEach((drug, index)=>{
        let compendiumEntry = FindCompendiumEntry(drug.tradeName, data.compendium);
        if (compendiumEntry) {

            for (let i = index + 1; i < data.medlist.length; i++){
                compendiumEntry.interactionTags.forEach((tag)=>{
                    switch(tag.tagType){
                        case 'class':
                            
                    }
                });
            }

        }
    });
}

const FindCompendiumEntry = (tradeName, compendium) => {
    let tagIndex = tradeName.indexOf('-');
    let untaggedTradeName = tradeName.slice(tagIndex + 1).toLowerCase();
    let tradeNameLC = tradeName.toLowerCase(); 
    compendium.forEach((entry)=>{
        switch(entry.chemicalName.toLowerCase()){
            case tradeNameLC:
                return entry;
            case untaggedTradeName: 
                return entry;
            default: 
                let foundEntry = null;
                entry.tradeNames.forEach((tradeName)=>{
                    if (tradeNameLC == tradeName.toLowerCase()) { foundEntry = entry; }
                });
                return foundEntry;
        }
    });
}
