import axios from "axios";

const pkg = process.argv[2];
const version = process.argv[3];

axios
  .get(
    `https://api.github.com/repos/swpu-acm/algohub/git/refs/tags/${pkg}-v${version}`
  )
  .then((response) => {
    const data = JSON.parse(response.data);
    console.log(data[data.length - 1].ref.split("-")[1]);
  })
  .catch((error) => {
    console.error(error.data);
  });
