# Image-Puller-for-Social
Pulls image urls to a column in google sheets - a Google Apps Script to Populate Image URLs in a Google Sheet

This script fetches image filenames from a public directory listing and updates a target column in Google Sheets with comma-separated URLs that are compatible with social media schedulers such as Sociamonials.
It also matches your images to the post title, so make sure that your images are named "post_title_001.jpg", "post_title_002.jpg" etc. 

It CAN handle multiple of the same post title, but make sure your images are named:
the pattern for repeated post titles is 
Post_title_0001.jpg
Post_title_(1)_0001.jpg
If there is a  third usage, it would look like this:  
Post_title_(3)_0001.jpg

This is ideal for using with Zimmwriter, with the bulk social media scheduler and then making custom image sizes in the bulk image creator (just paste in your post titles). 

## Setup
Put the code in optional-index.php in the index.php of the directory where your images are uploaded. The appscript scrapes the output of this page!




## How to Use

1. Open your Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Copy the contents of `fillImageUrls.gs` into the editor.
4. Update:
   - The spreadsheet ID in `openById()`.
   - The sheet name (`"run1 for pinterest"` in this example).
   - The columns for `POST_TITLE_COL`.
   - The directory URL (`put your directory url here starting with https - like https://survivinghello.com/forsocial/pinterestry1/`).
5. Save and run `fillImageUrls()`.
6. Check **View > Logs** (in the classic editor) or **Executions** (in the new editor) if you need debugging output.

After running, each row with a valid post title will be populated with the matching image URLs in your chosen column.

## License

Add any license you like, e.g. [MIT](https://opensource.org/licenses/MIT).
