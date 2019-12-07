
export const identifyInputBeforeSave = (data) => {
    //Requires data.list, data.searchKeys, data.updateState, data.state, data.ifMatchSaveToRealm, data.saveRoot, data.atKey
    let list = getList({list: data.list, keys: data.searchKeys});
    let input = data.state[data.saveRoot][data.atKey]
    let matchFound = list.indexOf(input);
    if(matchFound !== -1){
        data.updateState('save', {what: data.ifMatchSaveToRealm, whose: data.state.profileComponent.currentProfile, root: data.saveRoot, keys: [data.atKey]});
    } else {
        if (!input) { data.updateState('by path and value', {path: 'message', value: 'Input cannot be empty.'}); } 
        else {
            data.updateState('by path and value', {path: `render.${data.ifMatchSaveToRealm}NoMatch`, value: true});
            data.updateState('by path and value', {path: `suggested${data.atKey}List`, value: generateSuggestedList({input: input, list: list}) }); //Dynamically create this state property
        }
    }
}

export const getList = (data) => {
    //requres data.list (contains an array of data, eg compendium), data.keys (keys of the relevant subdata you want)
    let list = [];
    data.list.forEach((item)=>{
        data.keys.forEach((key)=>{
            if ( key == 'class' && list.indexOf(item[key]) == -1 ) { list = [...list, item[key]]; }
            else { list = [...list, ...item[key]]; } 
        });
    });
    return list;
} 

//If no match found, use this to generate suggestions
export const generateSuggestedList = (data) => {
  //Requres data.input (what the input is), data.list (the list from which to pull suggestions)
  let regx = new RegExp(data.input, 'ig'); //For literal match of partial search term
  let index = data.input.indexOf('-');
  let inputIgnoreTag = data.input.slice(index + 1);
  let regx2 = new RegExp(inputIgnoreTag, 'ig'); //For ignore tag and match partial search term
  let letters = inputIgnoreTag.toLowerCase().split(""); //For fuzzy matching (ignoring tag) of full search term
  let matches = [];
  data.list.forEach((item)=>{
      if ( regx.test(item) ) { matches.push(item); } 
      else if (regx2.test(item) && inputIgnoreTag) { matches.push(item); } //Must check if inputIgnoreTag is truthy or else will match all list items
      else {  
          let fuzzyMatchCount = 0;
          let index = item.indexOf('-');
          let itemNoTag = item.toLowerCase().slice(index + 1); 
          letters.forEach((letter, i)=>{
              if (itemNoTag.charAt(i-1) == letter || itemNoTag.charAt(i) == letter || itemNoTag.charAt(i+1) == letter){ 
                  fuzzyMatchCount++; 
              } 
          });
          if (fuzzyMatchCount/letters.length > 0.7){ matches.push(item); } //Can adjust this to make match more strictly or loosely
      } 
  });
  return matches;
}