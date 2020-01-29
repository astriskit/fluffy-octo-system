const fishCape = (_, val) => {
  if (typeof val != "string") return val;
  return val.replace(/[\n]/g, "\n");
};

export default fishCape;
