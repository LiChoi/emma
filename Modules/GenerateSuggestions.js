//From a database, generate a list containing the items you want to check against
export const getList = (data) => {
    //requres data.list (contains an array of data, eg compendium), data.keys (keys of the relevant subdata you want)
    let tradeNameList = [];
    data.list.forEach((item)=>{
        data.keys.forEach((key)=>{
            if (key == 'tradeNames') { tradeNameList = [...tradeNameList, ...item[key]]; }  //the concat method was adding the arrays into the tradeNameList array rather than each item for some reason
            else if (key == 'class' && tradeNameList.indexOf(item[key]) == -1) { tradeNameList = [...tradeNameList, item[key]]; }
        });
    });
    return tradeNameList;
} 

//Use to find a match before generating suggestions
export const findMatch = (data) => {
    let matches = false; 
    data.list.forEach((item)=>{
        if (data.item == item) { matches = true; }
    });
    return matches;
}

//If no match found, use this to generate suggestions
export const generateSuggestedList = (data) => {
  //Requres data.input (what the input is), data.list (the list from which to pull suggestions), optionally can include data.also to specifiy additional stuff to find
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