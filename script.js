const fse = require('fs-extra');
const glob = require('glob');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var WordExtractor = require("word-extractor");
var extractor = new WordExtractor();


/////////////////////////////////////////////////////////////////////////// Export CSV

// Called later within the asynchronus function
function exportCSV() {
	return new Promise(resolve => {
		setTimeout(() => {

// Convert JSON data to CSV
const csvWriter = createCsvWriter({
path: './desktop/docsOutput/csv/out.csv',
header: [
	{id: 'slug', title: 'Slug'},
	{id: 'content_url', title: 'Content_URL'},
	{id: 'page_title', title: 'Page_Title'},
	{id: 'sea_title', title: 'Seo_Title'},
	{id: 'body', title: 'Body'},
]
});

csvWriter
.writeRecords(dataOutput)
.then(()=> console.log('The CSV file was written successfully'));

}, 0);
	});
};

/////////////////////////////////////////////////////////////////////////// Export CSV end




let head = '';
let bodyRaw = [];
let body = '';
let value = '';
let raw;
let dataOutput = [];

// array of paths to files
const files = glob.sync('./desktop/docs/**/*.doc');


/////////////////////////////////////////////////////////////////////////// function for extraction & modification
function runExtraction() { // called at bottom

	// loop through files
	for (let item of files) {

		//extract item
		let extracted = extractor.extract(item);

		// run async extract
		async function extractDocs() {
		  let promise = new Promise((resolve, reject) => {
		    extracted.then(function(doc) {
		      value = doc.getBody(); //takes around 1s
					console.log(value)
		    });
		  });
		  let result = await promise; // wait till the promise
		  return result
		}

	// Data has been extracted and foolowing code will modify

	// Extract filename from path
	let filenameTxt = item.replace(/^.*[\\\/]/, '');
	let filename = filenameTxt.replace(/.doc/, '');
	let slug = filename.toLowerCase();

	//	Check to see if there's a header
	let headMatch = head.trim().replace(/\s/g,'-');
	if (headMatch !== filename) {
		// return first para/sentence to body
		bodyRaw.unshift(head)
		head = filename;
		head = head.replace(/-/g,' ');
	}
	else {
		// do nothing
	}

	// Filter out any empty array elements and wraps paragraphs in <p> tags
	bodyRaw = bodyRaw.filter(function( element ) {
	  return element !== '';
	});
	for (let i = 0; i < bodyRaw.length; i++) {
		body += '<p>' + bodyRaw[i] + '</p>';
	}

	//remove .doc from URL
	let content_url = item.toLowerCase().replace(/.doc/g, '');

	// Create an object and add properties
	let dataObject = {};

	dataObject["slug"] = slug;
	dataObject["page_title"] = head;
	dataObject["content_url"] = content_url;
	dataObject["sea_title"] = head;
	dataObject["body"] = body;

	// push object into array (JSON)
	dataOutput.push(dataObject)
	body = ''; //reset body value

	};
	// Run the CSV creater after loop is finished
	exportCSV()
};

/////////////////////////////////////////////////////////////////////////// function for extraction & modification

// execute
runExtraction()
