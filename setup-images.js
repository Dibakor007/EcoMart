const fs = require('fs');
const path = require('path');
const https = require('https');

const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48';
const destDir = path.join(__dirname, 'public', 'images'); // Served via Express static / Vite public

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy generated images from artifacts
const generatedImages = [
  'bamboo_utensil_set',
  'solar_power_bank',
  'recycled_glass_bottle',
  'organic_hemp_tote',
  'compostable_phone_case',
  'beeswax_food_wraps',
  'silicone_storage_bags',
  'detergent_strips',
  'bamboo_toothbrush',
  'stainless_steel_bento',
  'coconut_fiber_scrubber',
  'solar_camping_lantern',
  'organic_shampoo_bar'
];

try {
  if (fs.existsSync(artifactDir)) {
    fs.readdirSync(artifactDir).forEach(file => {
      if (file.endsWith('.png')) {
        for (const prefix of generatedImages) {
          if (file.startsWith(prefix)) {
            fs.copyFileSync(path.join(artifactDir, file), path.join(destDir, `${prefix}.png`));
            console.log(`Copied ${prefix}.png`);
            break;
          }
        }
      }
    });
  }
} catch(e) {
  console.log("Skipping artifact copy, files not found.");
}

// 2. Download remaining images from Pollinations AI
const toDownload = {
  'recycled_wool_blanket': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20cozy%20handcrafted%20recycled%20wool%20blanket%20folded%20on%20a%20bed%20or%20chair.%20Warm%20earthy%20tones,%20sustainable%20textile,%20premium%20quality?width=800&height=800&nologo=true',
  'cotton_produce_bags': 'https://image.pollinations.ai/prompt/product%20photography%20of%20organic%20cotton%20mesh%20produce%20bags%20containing%20fresh%20vegetables,%20sitting%20on%20a%20kitchen%20counter.%20Clean,%20zero%20waste,%20eco-friendly%20shopping?width=800&height=800&nologo=true',
  'cork_slim_wallet': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20slim%20minimalist%20wallet%20made%20from%20upcycled%20natural%20cork,%20resting%20on%20a%20clean%20wooden%20surface.%20Premium,%20eco-friendly%20accessory?width=800&height=800&nologo=true',
  'default_eco': 'https://image.pollinations.ai/prompt/beautiful%20green%20leaf%20minimalist%20eco%20friendly%20product%20placeholder?width=800&height=800&nologo=true'
};

// Also download the generated ones just in case the artifact copy failed
const fallbackDownloads = {
  'bamboo_utensil_set': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20reusable%20bamboo%20utensil%20set%20eco%20friendly?width=800&height=800&nologo=true',
  'solar_power_bank': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20sleek%20solar%20power%20bank%20outdoor?width=800&height=800&nologo=true',
  'recycled_glass_bottle': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20recycled%20glass%20water%20bottle%20with%20cork%20lid?width=800&height=800&nologo=true',
  'organic_hemp_tote': 'https://image.pollinations.ai/prompt/product%20photography%20of%20an%20organic%20hemp%20tote%20bag%20eco%20friendly?width=800&height=800&nologo=true',
  'compostable_phone_case': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20compostable%20phone%20case%20earth%20tones?width=800&height=800&nologo=true',
  'beeswax_food_wraps': 'https://image.pollinations.ai/prompt/product%20photography%20of%20colorful%20beeswax%20food%20wraps?width=800&height=800&nologo=true',
  'silicone_storage_bags': 'https://image.pollinations.ai/prompt/product%20photography%20of%20reusable%20silicone%20food%20storage%20bags?width=800&height=800&nologo=true',
  'detergent_strips': 'https://image.pollinations.ai/prompt/product%20photography%20of%20eco%20friendly%20laundry%20detergent%20strips?width=800&height=800&nologo=true',
  'bamboo_toothbrush': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20bamboo%20toothbrush%20bathroom?width=800&height=800&nologo=true',
  'stainless_steel_bento': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20stainless%20steel%20bento%20lunchbox?width=800&height=800&nologo=true',
  'coconut_fiber_scrubber': 'https://image.pollinations.ai/prompt/product%20photography%20of%20natural%20coconut%20fiber%20scrubber%20sponges?width=800&height=800&nologo=true',
  'solar_camping_lantern': 'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20portable%20solar%20camping%20lantern?width=800&height=800&nologo=true',
  'organic_shampoo_bar': 'https://image.pollinations.ai/prompt/product%20photography%20of%20an%20organic%20solid%20shampoo%20bar?width=800&height=800&nologo=true',
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function downloadMissing() {
  const allToDownload = { ...toDownload, ...fallbackDownloads };
  for (const [name, url] of Object.entries(allToDownload)) {
    const dest = path.join(destDir, `${name}.png`);
    if (!fs.existsSync(dest)) {
      await download(url, dest);
    }
  }
}

downloadMissing().then(() => {
  console.log("All product images successfully saved locally to public/images/!");
  
  // 3. Update the code to use the local images
  
  // Map of URLs to replace in backend/models/Product.ts and frontend/js/cart.js
  const imageMap = {
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20reusable%20bamboo%20utensil%20set%20eco%20friendly?width=800&height=800&nologo=true': '/images/bamboo_utensil_set.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20sleek%20solar%20power%20bank%20outdoor?width=800&height=800&nologo=true': '/images/solar_power_bank.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20recycled%20glass%20water%20bottle%20with%20cork%20lid?width=800&height=800&nologo=true': '/images/recycled_glass_bottle.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20an%20organic%20hemp%20tote%20bag%20eco%20friendly?width=800&height=800&nologo=true': '/images/organic_hemp_tote.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20compostable%20phone%20case%20earth%20tones?width=800&height=800&nologo=true': '/images/compostable_phone_case.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20colorful%20beeswax%20food%20wraps?width=800&height=800&nologo=true': '/images/beeswax_food_wraps.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20reusable%20silicone%20food%20storage%20bags?width=800&height=800&nologo=true': '/images/silicone_storage_bags.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20eco%20friendly%20laundry%20detergent%20strips?width=800&height=800&nologo=true': '/images/detergent_strips.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20bamboo%20toothbrush%20bathroom?width=800&height=800&nologo=true': '/images/bamboo_toothbrush.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20stainless%20steel%20bento%20lunchbox?width=800&height=800&nologo=true': '/images/stainless_steel_bento.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20natural%20coconut%20fiber%20scrubber%20sponges?width=800&height=800&nologo=true': '/images/coconut_fiber_scrubber.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20portable%20solar%20camping%20lantern?width=800&height=800&nologo=true': '/images/solar_camping_lantern.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20an%20organic%20solid%20shampoo%20bar?width=800&height=800&nologo=true': '/images/organic_shampoo_bar.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20handcrafted%20recycled%20wool%20blanket?width=800&height=800&nologo=true': '/images/recycled_wool_blanket.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20organic%20cotton%20mesh%20produce%20bags?width=800&height=800&nologo=true': '/images/cotton_produce_bags.png',
    'https://image.pollinations.ai/prompt/product%20photography%20of%20a%20cork%20slim%20wallet?width=800&height=800&nologo=true': '/images/cork_slim_wallet.png'
  };

  const filesToUpdate = [
    path.join(__dirname, 'backend', 'models', 'Product.ts'),
    path.join(__dirname, 'frontend', 'js', 'cart.js'),
    path.join(__dirname, 'frontend', 'js', 'checkout.js')
  ];

  filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Fix fallback in cart.js / checkout.js
      content = content.replace(
        /'https:\/\/images\.unsplash\.com\/photo-1542601906990-b4d3fb778b09[^']*'/g, 
        "'/images/default_eco.png'"
      );

      for (const [url, localPath] of Object.entries(imageMap)) {
        // Need to escape the URL for regex since it contains ? and &
        const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`'${escapedUrl}'`, 'g');
        content = content.replace(regex, `'${localPath}'`);
      }
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated URLs in ${path.basename(file)}`);
    }
  });

  console.log("Done! You can restart your server now.");
});
