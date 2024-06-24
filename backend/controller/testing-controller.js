const {
    emailinUserTable,
    addLeaves,
    getLeavsData,
    getAllLeavsData,
    insertNewUser,
    updatePassword,
    updateJWTToken,
    executeDynamicSQL,
    executeDynamicSQLByTable,
  } = require("../models/auth");

const sitemapOb = require("../services/sitemap-utils")


async function addUpdateSitemap(categoryString) {

    // Extract the first keyword up to the first '/'
    const category = categoryString.split('/')[0];

    const afterFirstSlash = categoryString.split('/').slice(1).join('/') ? categoryString.split('/').slice(1).join('/') : '' ;

  const baseUrl = `https://www.mindyourlogic.com/`;
  const sql = `SELECT * FROM paheliyan WHERE sub_categories = '${category.replace(/-/g, " ").toLowerCase()}'`;
  let totalBlogs = await executeDynamicSQLByTable(sql);
  const numberOfPages = Math.ceil(totalBlogs.length / 15);
  let mySitemap = sitemapOb.getExistingSitemap("main-sitemap.xml");

  // Escape special characters in baseUrl and category
  const escapedBaseUrl = escapeRegExp(baseUrl);
  const escapedCategory = escapeRegExp(category.toLowerCase());

  // Construct a regular expression to match the base URL and category, allowing for additional characters
  const regexString = `<loc>\\s*${escapedBaseUrl}${escapedCategory}${afterFirstSlash}[^<]*</loc>`;
  const regex = new RegExp(regexString, 'gi');

  // Use the RegExp constructor to dynamically create the regular expression;
  const matches = mySitemap.match(regex);

  // Set length to 0 if matches is null
  const matchesLength = matches ? matches.length : 0;

  const pagesToAdd = Math.max(0, (numberOfPages + 1) - matchesLength); // Ensure non-negative value

  if (pagesToAdd > 0) {
    for (let index = numberOfPages; index >= numberOfPages - pagesToAdd + 1; index--) {
      const pageLink = index === 0
        ? `${baseUrl}${category.toLowerCase()}${afterFirstSlash}`
        : `${baseUrl}${category.toLowerCase()}${afterFirstSlash}?page=${index}`;

      const generatedXmlContent = await sitemapOb.generateXmlContent({
        link: pageLink,
        date: "2023-10-10",
      });

      await sitemapOb.appendToSitemapNew(
        `main-sitemap.xml`,
        generatedXmlContent
      );
    }
  }

}


// Function to escape special characters in a string for regular expression
function escapeRegExp(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
  
  module.exports = {
    addUpdateSitemap
  };
  