const fs = require('fs').promises;
const prettier = require('prettier');

const svgDirectory = 'src/svg/';
const path = __dirname + '/src/';
const warningHeader = `// -- This is an auto-generated file. Do not edit.`;

/**
 * Scan for all the files inside /svg
 */
const init = async () => {
	console.log('Processing files ...');

	const svgs = await fs.readdir(svgDirectory);

	svgs.forEach(createJSX);

	createIndex(svgs);
	createIconsMD(svgs);
};

/**
 * Create a JSX file out of a SVG file
 *
 * @param {string} file - The name of the file to process
 */
const createJSX = async (file) => {
	console.log(`Creating JSX file for : ${file}`);

	const fileName = file.replace('.svg', '');
	const iconName = toCamelCase(fileName);

	renderSVG(fileName).then(async ({ svg, primitivesUsed }) => {
		let newFileContent = `${warningHeader}

		import { ${Array.from(primitivesUsed).join(', ')} } from '@wordpress/primitives';

		const ${iconName} = (${svg});

		export default ${iconName}`;

		newFileContent = await prettier.format(newFileContent, {
			singleQuote: true,
			useTabs: false,
			tabWidth: 4,
			parser: 'babel'
		});

		await writeFile(`${path}library/`, `${fileName}.js`, newFileContent);
	});
};

async function renderSVG(filename) {
	let svg = '';
	const primitivesUsed = new Set();

	const name = `${filename}.svg`;
	let content = await fs.readFile(svgDirectory + name, 'utf-8');

	content = replacePrimitives(content);
	findPrimitives(content).forEach((primitive) => primitivesUsed.add(primitive));

	content = content.replace(/class\=\"/g, 'className="');

	svg = content;

	return {
		svg,
		primitivesUsed
	};
}

/**
 * Create the index file that contains all the icons
 *
 * @param {array} files - An array of all the files
 */
createIndex = async (files) => {
	console.log(`Creating index file`);

	let content = warningHeader + "\r\n\r\n";

	files.forEach((file) => {
		const filename = file.replace('.svg', '');

		content = content + `export { default as ${toCamelCase(filename)} } from './library/${filename}';\r\n`;
	});

	//await fs.mkdir(path, { recursive: true });
	await writeFile(`${path}`, 'index.js', content);
};

/**
 * Create the Icons markdown file
 *
 * @param {array} files - An array of all the files
 */
createIconsMD = async (files) => {
	console.log(`Creating icons markdown file`);

	let content = `# Icons

| Icon   | Component name   |
| ------ | ---------------- |\r\n`;

	for (const file of files) {
		const fileName = file.replace('.svg', '');
		const iconName = toCamelCase(fileName);

		content = content + `| <img src="./src/svg/${fileName}.svg" width="24" height="24"> | ${iconName} |\r\n`;
	};

	await writeFile(`${__dirname}/`, 'icons.md', content);
};

/**
 * Replace primitives in SVG to match React imports
 *
 * @param {string} str - The content
 * @return {string} The new content with items replaced
 */
const replacePrimitives = (str) => {
	const primitivesToReplace = {
		'<svg': '<SVG',
		'svg>': 'SVG>',
		'<g': '<G',
		'g>': 'G>',
		'<path': '<Path',
		'<rect': '<Rect',
		'<circle': '<Circle',
		'<polygon': '<Polygon',
		'<defs': '<Defs',
		'stroke-width': 'strokeWidth',
		'fill-rule': 'fillRule',
		'clip-rule': 'clipRule',
		'stroke-linejoin': 'strokeLinejoin',
		'stroke-linecap': 'strokeLinecap',
		'tabindex': 'tabIndex',
		'datetime': 'dateTime',
		'stroke-width': 'strokeWidth',
		'fill="black"': '',
		'fill="none"': ''
	};
	const regx = new RegExp(Object.keys(primitivesToReplace).join('|'), 'gi');

	return str.replace(regx, (matched) => primitivesToReplace[matched]);
};

/**
 * Find primitives inside content
 *
 * @param {string} str - The content
 * @return {string} Primitives used ready to used in an import statement
 */
findPrimitives = (content) => {
	const primitives = ['SVG', 'Path', 'G', 'Rect', 'Circle', 'Polygon', 'Defs'];

	return primitives.filter((primitive) => content.indexOf(`<${primitive}`) != -1);
}

/**
 * Write the file and write the required directories if needed
 *
 * @param {string} path - The path where the new file should live
 * @param {string} filename - The name of the new file
 * @param {string} content - The content of the file
 */
const writeFile = async (path, filename, content) => {
	await fs.mkdir(path, { recursive: true });
	await fs.writeFile(path + filename, content);
};

/**
 * Camel Case a string
 * 
 * @param {string} text - The string to camel case
 * @return {string} The camel cased string
 */
const toCamelCase = (text) => {
	text = toPascalCase(text);
	text = text.charAt(0).toLowerCase() + text.slice(1)

	return text;
}

/**
 * Pascal Case a string
 *
 * @param {string} text - The string to pascal case
 * @return {string} The pascal cased string
 */
const toPascalCase = (text) => text.replace(/(^\w|-\w)/g, clearAndUpper);

/**
 * Remove dashes and uppercase next letter
 *
 * @param {string} text - The string to uppercase
 * @return {string} The upper cased string
 */
const clearAndUpper = (text) => text.replace(/-/, '').toUpperCase();

init();