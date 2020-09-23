let gs1dlt = new GS1DigitalLinkToolkit();
let noDaAttributes = 0;
const placeHolder = 'Please select a data attribute';
const terryScript = 'http://bwipjs-api.metafloor.com/?bcid='; // gs1datamatrix&text=(01)' +  gtins[i].gtin;


window.onload = init;    

function init() {
  let primaryKeyAI = document.getElementById('primaryKeyAI');
  let primaryKeyValue = document.getElementById('primaryKeyValue');
  primaryKeyAI.addEventListener('change', function () {updateKQs(this.value)}, false);

  gs1dlt.aitable.forEach(function (k) {
    if (k.type == 'I') {                        // We have a primay key
      let o = document.createElement('option');
      o.value = k.ai;
      o.appendChild(document.createTextNode('[' + k.ai + '] ' + k.title));
      if (k.ai == '01') {o.selected = true} // default to GTIN
      primaryKeyAI.appendChild(o);
    }
  });
  updateKQs(primaryKeyAI.value);
  updateDAs();
  let goResolver = document.getElementById('goResolver');
  goResolver.addEventListener('change', function() {document.getElementById('userResolver').disabled = this.checked ? true : false}, false);
  createGenerateButton();
  let gButton = document.getElementById('useExample');
  gButton.addEventListener('click', fillExample, false);
}

function createGenerateButton() {
  let h2 = document.createElement('h2');
  h2.appendChild(document.createTextNode('Output'));
  let gButton = document.createElement('button');
  gButton.id = 'generate';
  gButton.appendChild(document.createTextNode('Print Barcode'));
  gButton.addEventListener('click', generateOutput, false);
  let outputArea = document.getElementById('outputArea');
  outputArea.appendChild(h2);
  outputArea.appendChild(gButton);
}

function updateKQs(primaryAI) {
  let kqInput = document.getElementById('keyQualifierInput');
  kqInput.innerHTML = '';
  let h3 = document.createElement('h3');
  h3.appendChild(document.createTextNode('Key qualifiers'));
  kqInput.appendChild(h3);
  if (gs1dlt.aiQualifiers[primaryAI] != undefined) {
    gs1dlt.aiQualifiers[primaryAI].forEach(function (kq) {
      let label = document.createElement('label');
      label.for = kq;
      label.appendChild(document.createTextNode('[' + kq + '] ' + gs1dlt.aitable.find(x => x.ai == kq).title));
      let input = document.createElement('input');
      input.type='text';
      input.id = kq;
      kqInput.appendChild(label);
      kqInput.appendChild(input);
    });
  } else {
    kqInput.appendChild(document.createTextNode('There are no qualifiers for a ' + gs1dlt.aitable.find(x => x.ai == primaryAI).title));
  }
}

function updateDAs() {
  daInput = document.getElementById('daInput');
  daInput.innerHTML = '';
  let h3 = document.createElement('h3');
  h3.appendChild(document.createTextNode('Data attributes'));
  daInput.appendChild(h3);
  daInput.appendChild(createDataAttributeInput());
}


function createDataAttributeInput() {
  noDaAttributes++;
  let div = document.createElement('div');
  div.id = 'daInput' + noDaAttributes;
  let sel = document.createElement('select');
  sel.id = 'DaSelector' + noDaAttributes;
  let o = document.createElement('option');
  o.appendChild(document.createTextNode(placeHolder));
  sel.appendChild(o);
  gs1dlt.aitable.forEach(function (k) {
    if (k.type == 'D') {
      o = document.createElement('option');
      o.value = k.ai;
      o.appendChild(document.createTextNode('[' + k.ai + ']' + ' ' + k.title));
      sel.appendChild(o);
    }
  });
  let label = document.createElement('label');
  label.for = 'DaValue' + noDaAttributes;
  label.appendChild(document.createTextNode('Value'));
  let input = document.createElement('input');
  input.type = 'text';
  input.id = 'DaValue' + noDaAttributes;
  div.appendChild(sel);
  div.appendChild(label);
  div.appendChild(input);
  let span = document.createElement('span');
  span.classList.add('addDA');
  span.title = 'Add another data attribute';
  span.appendChild(document.createTextNode('+'));
  span.addEventListener('click', addDataAttribute, false);
  div.appendChild(span);
  span = document.createElement('span');
  span.classList.add('removeDA');
  if (noDaAttributes > 1) {span.title = 'Remove this data attribute'}
  span.appendChild(document.createTextNode('-'));
  span.addEventListener('click', function() {removeDataAttribute(div.id)}, false);
  div.appendChild(span);
  return div;
}

function addDataAttribute() {
  document.getElementById('daInput').appendChild(createDataAttributeInput());
}

function removeDataAttribute(e) {
  if (e == 'daInput1') {
    document.getElementById('DaValue1').value = '';
    document.getElementById('DaSelector1').value = placeHolder;
  } else {
    let nodeToRemove = document.getElementById(e);
    nodeToRemove.parentNode.removeChild(nodeToRemove);
  }
}

function fillExample() {
  document.getElementById('primaryKeyAI').value = '01';
  document.getElementById('primaryKeyValue').value = '00814141000221';
  updateKQs('01');
  document.getElementById('10').value = 'ABCDEF';
  document.getElementById('21').value = '1234';
  updateDAs();
  let children = document.getElementById('daInput').childNodes;
  let n = children[1].id.substr(7);
  document.getElementById('DaSelector' + n).value = '17';
  document.getElementById('DaValue' + n).value = '221225';
}

function generateOutput() {
  // Basic assumption is the the gs1dlt will do our error checking for us. 
  // So we construct an associatve array as if there are no errors in the input data, but try and give meaningful error messages from the gs1dlt
  let a = {};
  let outputArea = document.getElementById('outputArea');
  outputArea.innerHTML = '';
  createGenerateButton();
  // primary key is easy
  a[document.getElementById('primaryKeyAI').value] = document.getElementById('primaryKeyValue').value;

  // now we want the key qualifers (if any)
  let kqInput = document.getElementById('keyQualifierInput');
  let children = kqInput.childNodes;
  children.forEach(function(i) {
    if ((i.nodeName == 'INPUT') && (i.value !== '')) {
      a[i.id] = i.value;
    }
  });

  // Now we want the data attributes

  let daInput = document.getElementById('daInput');
  divs = daInput.childNodes;
  divs.forEach(function(i) {
    if (i.nodeName == 'DIV') {
      let dataAttributes = i.childNodes;
      let k, v;
      dataAttributes.forEach(function(d) {
        if (d.nodeName == 'SELECT') {
          k = d.value;
        } else if (d.nodeName == 'INPUT') {
          v = d.value;
        }
      });
      if (v !== '') {a[k] = v};
    }
  });
  console.log(a);

  // So we have our associative array (a) and we want to pass this into the gs1dlt

  try {
    // If we're here, we have a valid set of AIs and values
    // Start with Human readable AI syntax
    // The next line will raise an error if there's anything wrong with any of the values
    let gs1ElementStrings = gs1dlt.buildGS1elementStrings(a,true);
    // But it's not ordered with fixed length strings first so we actually need to use the sorted function
    gs1ElementStrings = sortElementString(a);
    let p = document.createElement('p');
    p.id = 'AIbrackets';
    let thSpan = document.createElement('span');
    thSpan.classList.add('th');
    thSpan.appendChild(document.createTextNode('Human-readable AI syntax'));
    p.appendChild(thSpan);
    let tdSpan = document.createElement('span');
    tdSpan.classList.add('td');
    tdSpan.appendChild(document.createTextNode(gs1ElementStrings));
    // p.appendChild(tdSpan);
    // outputArea.appendChild(p);

    // Now AI syntax

    p = document.createElement('p');
    p.id = 'AInoBrackets';
    thSpan = document.createElement('span');
    thSpan.classList.add('th');
    thSpan.appendChild(document.createTextNode('Pure AI syntax'));
    p.appendChild(thSpan);
    tdSpan = document.createElement('span');
    tdSpan.classList.add('td');
    tdSpan.appendChild(document.createTextNode(gs1dlt.buildGS1elementStrings(a,false)));
    // That function *does* put the fixed length AIs first
    // p.appendChild(tdSpan);
    // outputArea.appendChild(p);

    //Now DL URI

    let dlURI = gs1dlt.gs1ElementStringsToGS1DigitalLink(gs1ElementStrings, false, getResolver())
    p = document.createElement('p');
    p.id = 'dlURI';
    thSpan = document.createElement('span');
    thSpan.classList.add('th');
    thSpan.appendChild(document.createTextNode('GS1 Digital Link URI'));
    p.appendChild(thSpan);
    tdSpan = document.createElement('span');
    tdSpan.classList.add('td');
    let hyperlink = document.createElement('a');
    hyperlink.href = dlURI;
    hyperlink.title = gs1ElementStrings;
    hyperlink.appendChild(document.createTextNode(dlURI));
    tdSpan.appendChild(hyperlink);
    // p.appendChild(tdSpan);
    // outputArea.appendChild(p);

    let figure = document.createElement('figure');
    figure.id = 'dm';
    let img = document.createElement('img');
    img.alt = 'GS1 Data Matrix for supplied data';
    img.src = terryScript + 'gs1datamatrix&text=' + gs1ElementStrings;
    // console.log('sending ' + gs1ElementStrings + ' to the DataMatrix generator');
    figure.appendChild(img);
    let figcaption = document.createElement('figcaption');
    figcaption.appendChild(document.createTextNode(gs1ElementStrings));
    // figure.appendChild(figcaption);
    // outputArea.appendChild(figure);

    figure = document.createElement('figure');
    figure.id = 'qr';
    img = document.createElement('img');
    img.alt = 'QR code containing GS1 Digital Link URI for supplied data';
    img.src = terryScript + 'qrcode&text=' + dlURI;
    figure.appendChild(img);
    figcaption = document.createElement('figcaption');
    figcaption.appendChild(document.createTextNode(dlURI));
    // figure.appendChild(figcaption);
    // outputArea.appendChild(figure);
    if (document.getElementById('primaryKeyAI').value === '01') {
      let bcType = 'ean14'; let gtin = document.getElementById('primaryKeyValue').value;
      if (gtin.indexOf('0') === 0) { // might be 13 or 12
        gtin = gtin.substring(1);
        bcType = 'ean13';
      } else {
        gtin = '(01)' + gtin;
      }
      figure = document.createElement('figure');
      figure.id = 'ean';
      img = document.createElement('img');
      img.alt = '1D barcode carrying the GTIN (only)';
      img.src = terryScript + bcType + '&text=' + gtin;
      console.log(img.src)
      figure.appendChild(img);
      figcaption = document.createElement('figcaption');
      figcaption.appendChild(document.createTextNode(gtin));
      figure.appendChild(figcaption);
      outputArea.appendChild(figure);

    }

  } catch(err) {
  	console.log(err);
    outputArea.innerHTML = err;
  }
}

function sortElementString(a) {
  // Need to sort the array so that the order is:
  // Primary key
  // Fixed length
  // The rest

  // a is an associative array of AIs and their values.
  // We need to create a version of the string in the right order for sending to the DataMatrix
  let sorted = ''
  for (i in a) {    // Look for the primary key
    if (gs1dlt.aitable.find(x => x.ai == i).type == 'I') {
      sorted = '(' + i + ')' + a[i];
    }
  }
  for (i in a) {    // Look for fixed length AIs
    if ((sorted.indexOf('('+ i + ')') == -1) && (gs1dlt.aitable.find(x => x.ai == i).fixedLength == true)) {
      sorted += '(' + i + ')' + a[i];
    }
  }
  for (i in a) {    // Everything else
    if (sorted.indexOf('('+ i + ')') == -1) {
      sorted += '(' + i + ')' + a[i];
    }
  }
  return sorted;
}

function getResolver() {
  return ((!document.getElementById('goResolver').checked) && (document.getElementById('userResolver').value != 'https://')) ? document.getElementById('userResolver').value : 'https://id.gs1.org/';
}