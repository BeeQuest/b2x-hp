export default {
  permalink(data) {
    const stem = (data.page?.filePathStem || "").replace(/^\//, "");
    if (!stem || stem.startsWith("_")) return data.permalink;
    if (stem === "index") return "/index.html";
    return `/${stem}.html`;
  },
};
