import axios from "axios";

axios
  .get(
    `https://api.github.com/repos/swpu-acm/algohub/git/refs/tags/`
  )
  .then((response) => {
    const data = response.data;
    console.log(data[data.length - 1].ref.split("-v")[1]);
  })
  .catch((error) => {
    console.error(error.data);
  });
