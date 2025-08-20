import { getData } from "country-list";

const countries = getData() // [{ name: 'Afghanistan', code: 'AF' }, ...]
  .sort((a, b) => a.name.localeCompare(b.name));

export default countries;
