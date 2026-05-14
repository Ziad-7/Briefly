const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replaceMap = {
    // Fonts 
    'font-display-lg-mobile md:font-display-lg ': '',
    'font-display-lg-mobile ': '',
    'md:font-display-lg ': '',
    'font-display-lg ': '',
    'font-headline-md ': '',
    'font-body-base ': '',
    'font-body-sm ': '',
    'font-label-mono ': '',
    
    // Text sizes
    'text-display-lg-mobile md:text-display-lg': 'text-4xl md:text-5xl font-bold tracking-tight leading-tight',
    'text-display-lg-mobile': 'text-4xl font-bold tracking-tight leading-tight',
    'text-display-lg': 'text-5xl font-bold tracking-tight leading-tight',
    'text-headline-md': 'text-2xl font-semibold tracking-tight leading-snug',
    'text-body-base': 'text-base leading-relaxed',
    'text-body-sm': 'text-sm leading-relaxed',
    'text-label-mono': 'text-xs font-mono font-medium tracking-wide uppercase',
    
    // Containers
    'max-w-container-max': 'max-w-7xl',
    'px-margin-mobile': 'px-6',
    
    // Spacing defaults mapping just in case
    'p-xs': 'p-1',
    'p-sm': 'p-3',
    'p-md': 'p-4',
    'p-lg': 'p-6',
    'p-xl': 'p-8',
    'px-xs': 'px-1',
    'px-sm': 'px-3',
    'px-md': 'px-4',
    'px-lg': 'px-6',
    'px-xl': 'px-8',
    'py-xs': 'py-1',
    'py-sm': 'py-3',
    'py-md': 'py-4',
    'py-lg': 'py-6',
    'py-xl': 'py-8',
    'gap-xs': 'gap-2',
    'gap-sm': 'gap-3',
    'gap-md': 'gap-4',
    'gap-lg': 'gap-6',
    'gap-xl': 'gap-8',
    'mb-xs': 'mb-2',
    'mb-sm': 'mb-3',
    'mb-md': 'mb-4',
    'mb-lg': 'mb-6',
    'mb-xl': 'mb-8',
    'mt-xs': 'mt-2',
    'mt-sm': 'mt-3',
    'mt-md': 'mt-4',
    'mt-lg': 'mt-6',
    'mt-xl': 'mt-8',
    'pb-2xl': 'pb-16',
    'pt-2xl': 'pt-16',
    'md:ml-64': '' // Removing conflicting layout wrappers
};

const dirs = [
    'e:/Ziad/EUI/Z/AI Sprint Hackathon/Project/stitch_briefly_ai_intake_layer/briefly/app', 
    'e:/Ziad/EUI/Z/AI Sprint Hackathon/Project/stitch_briefly_ai_intake_layer/briefly/components'
];

dirs.forEach(dir => {
    walk(dir, filePath => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;
            
            for (const [key, value] of Object.entries(replaceMap)) {
                let escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regex = new RegExp(escapedKey, 'g');
                content = content.replace(regex, value);
            }
            
            if (content !== original) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        }
    });
});
