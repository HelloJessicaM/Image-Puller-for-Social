/**
 * Main function to fill Image URLs in the "run1 for pinterest" tab
 */
function fillImageUrls() {
  // 1) Open the spreadsheet and get the target sheet
  const ss = SpreadsheetApp.openById("add the id of your google sheet");
  const sheet = ss.getSheetByName("add the tab name that you're wanting populated with image urls");

  // 2) Identify columns in the sheet
  //    post_id (1), post_publish_date (2), post_categories (3), ...
  //    post_title (5), post_url (6), ImageURL (7), ...
  const HEADER_ROW = 1;
  const POST_TITLE_COL = 5; // column E
  const IMAGE_URL_COL = 7;  // column G

  // 3) Fetch all .jpg filenames from the directory listing
  const filenames = fetchImageFilenames("Your publicly reachable directory url where the pictures are");

  // 4) Build a dictionary of base -> [matching filenames]
  const fileDict = buildFileDictionary(filenames);

  // 5) Get all the row data
  const lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) {
    Logger.log("No data rows found.");
    return;
  }
  // Example: read columns A through I (9 cols) from row 2 to lastRow
  const dataRange = sheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, 9);
  const data = dataRange.getValues();

  // We'll track how many times each EXACT post_title appears
  const usageCounter = {};

  // 6) Loop through rows
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const postTitle = row[POST_TITLE_COL - 1]; // zero-based

    if (!postTitle) {
      // If there's no post_title in this row, skip
      continue;
    }

    // Increase usage count for this title
    if (!usageCounter[postTitle]) {
      usageCounter[postTitle] = 1;
    } else {
      usageCounter[postTitle]++;
    }

    const occurrence = usageCounter[postTitle]; // 1,2,3...

    // Convert the post title into the base used for the filename
    const base = convertTitleToBase(postTitle);

    // For the nth time we see this title:
    // - 1st time => match "base"
    // - 2nd time => match "base_(1)"
    // - 3rd time => match "base_(2)"
    let dictKey = base;
    if (occurrence > 1) {
      dictKey += `_(${occurrence - 1})`;
    }

    // Retrieve the array of matching filenames
    let matched = fileDict[dictKey] || [];

    // Prepend full URL path
    matched = matched.map(fn => "https://survivinghello.com/forsocial/pinterestry1/" + fn);

    // Join with commas (no spaces)
    const imageUrlString = matched.join(",");

    // Write result to the ImageURL column
    const rowIndexInSheet = HEADER_ROW + i + 1;
    sheet.getRange(rowIndexInSheet, IMAGE_URL_COL).setValue(imageUrlString);
  }

  Logger.log("Done populating ImageURL column!");
}


/**
 * Fetch .jpg filenames from the directory listing at the given URL.
 * Your listing includes single quotes and "./" for each link, e.g.:
 * <a href='./some_filename.jpg'>some_filename.jpg</a>
 */
function fetchImageFilenames(listingUrl) {
  const resp = UrlFetchApp.fetch(listingUrl);
  const html = resp.getContentText();

  // Regex captures anything inside href='./...'.jpg or href="./...".jpg
  // We allow optional dot/slash (./ or /), then capture everything until .jpg
  const regex = /href=['"]\.?\/([^'"]+\.jpg)['"]/gi;

  const output = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    output.push(match[1]);
  }

  return output;
}


/**
 * Build a dictionary: baseKey -> array of filenames
 * e.g. "5_Best_Meditation_Spaces_for_Personal_Growth_0001.jpg"
 * grouped by the base "5_Best_Meditation_Spaces_for_Personal_Growth".
 */
function buildFileDictionary(filenames) {
  const dict = {};

  filenames.forEach(fn => {
    // Remove any leading "./" or "/"
    fn = fn.replace(/^\.?\//, "");

    // Match "base_0001.jpg" => base + _ + digits
    // Adjust if your pattern has 3 or 5 digits, e.g. \d{3} or \d+
    const match = fn.match(/^(.*)_(\d{4})\.jpg$/);
    if (!match) {
      return; // skip filenames that don't fit
    }

    const base = match[1]; // e.g. "5_Best_Meditation_Spaces_for_Personal_Growth_(1)"

    if (!dict[base]) {
      dict[base] = [];
    }
    dict[base].push(fn);
  });

  // Sort so 0001, 0002, 0003
  Object.keys(dict).forEach(key => {
    dict[key].sort();
  });

  return dict;
}


/**
 * Convert a human-readable post_title to the pattern used in filenames.
 * e.g. "5 Best Meditation Spaces for Personal Growth"
 * -> "5_Best_Meditation_Spaces_for_Personal_Growth"
 */
function convertTitleToBase(title) {
  return title
    .trim()
    // Replace spaces with underscores
    .replace(/\s+/g, "_")
    // Remove punctuation not allowed in your filenames
    .replace(/[^\w\(\)_]+/g, "");
}
