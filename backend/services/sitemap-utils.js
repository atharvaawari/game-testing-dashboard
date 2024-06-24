const fs = require("fs");
const path = require("path");
const XmlFormatter = require("xml-formatter");


async function generateXmlContent(articles) {
  let xmlContent = "";

  xmlContent += `<url>\n`;
  xmlContent += `<loc>${articles.link} </loc>\n`;
  xmlContent += `<lastmod>${articles.date}</lastmod>\n`;
  xmlContent += `<priority>0.8</priority>\n`;
  xmlContent += `</url>\n`;

  return xmlContent;
}


async function appendToSitemapNew(existingSitemapPath1, xmlContent) {
  const existingSitemapPath = path.resolve(__dirname, '..', 'txt_file', existingSitemapPath1);

  try {
    // Read the existing sitemap file if it exists
    let data = '';
    try {
      data = await fs.promises.readFile(existingSitemapPath, 'utf8');
    } catch (readError) {
      if (readError.code !== 'ENOENT') {
        // Error other than file not found
        throw readError;
      }

      // File doesn't exist, create a new sitemap file asynchronously with a default URL
      const newSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        </urlset>`;

      await fs.promises.writeFile(existingSitemapPath, newSitemapContent, 'utf8');
      console.log('New sitemap file created successfully.');
      return; // Return after creating the new file
    }

    // Find the closing </urlset> tag
    const closingTagIndex = data.lastIndexOf('</urlset>');
    if (closingTagIndex === -1) {
      console.error('Error: Invalid sitemap file format');
      return;
    }

    // Insert new sitemap content before the closing </urlset> tag
    const modifiedXmlContent =
      data.slice(0, closingTagIndex) + xmlContent + data.slice(closingTagIndex);

    // Write the modified XML content back to the existing sitemap file
    await fs.promises.writeFile(existingSitemapPath, modifiedXmlContent, 'utf8');
    console.log('New sitemap content has been appended successfully.');
  } catch (err) {
    console.error('Error processing existing sitemap file:', err);
  }
}


function appendToSitemap(existingSitemapPath1, xmlContent) {
  const existingSitemapPath = path.resolve(
    __dirname,
    "..",
    "txt_file",
    existingSitemapPath1
  );

  // Read the existing sitemap file
  fs.readFile(existingSitemapPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading existing sitemap file:", err);
      return;
    }

    // Find the closing </urlset> tag
    const closingTagIndex = data.lastIndexOf("</urlset>");
    if (closingTagIndex === -1) {
      console.error("Error: Invalid sitemap file format");
      return;
    }

    // Insert new sitemap content before the closing </urlset> tag
    const modifiedXmlContent =
      data.slice(0, closingTagIndex) + xmlContent + data.slice(closingTagIndex);

    // Format the modified XML content
    const formattedXmlContent = XmlFormatter(modifiedXmlContent);

    // Write the modified and formatted XML content back to the existing sitemap file
    fs.writeFile(existingSitemapPath, formattedXmlContent, "utf8", (err) => {
      if (err) {
        console.error("Error writing to existing sitemap file:", err);
        return;
      }
      console.log(
        "New sitemap content has been appended and formatted successfully."
      );
    });
  });
}


function getSitemap(existingSitemapPath1) {
  const existingSitemapPath = path.resolve(
    __dirname,
    "..",
    "txt_file",
    existingSitemapPath1
  );

  try {
    const data = fs.readFileSync(existingSitemapPath, "utf8");
    return data;
  } catch (err) {
    console.error("Error reading the file:", err);
  }
}


function getExistingSitemap(existingSitemapPath1) {
  const existingSitemapPath = path.resolve(
    __dirname,
    "..",
    "txt_file",
    existingSitemapPath1
  );

  try {
    // Try to read the file
    const data = fs.readFileSync(existingSitemapPath, "utf8");
    return data;
  } catch (err) {
    // If the file doesn't exist, create an empty one
    if (err.code === "ENOENT") {
      try {
        fs.writeFileSync(existingSitemapPath, "", "utf8");
        console.log("Sitemap file created successfully.");
        return ""; // Return an empty string for a new file
      } catch (writeErr) {
        console.error("Error creating the file:", writeErr);
      }
    } else {
      console.error("Error reading the file:", err);
    }
  }
}

module.exports = {
  appendToSitemap,
  generateXmlContent,
  getSitemap,
  getExistingSitemap,
  appendToSitemapNew,
};
