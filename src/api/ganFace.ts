export const getGanFace = async () => {
  console.log("ley", process.env.GATSBY_RAPID_API_KEY);
  const response = await fetch(
    "https://face-generator.p.rapidapi.com/faces/random",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "face-generator.p.rapidapi.com",
        "x-rapidapi-key": process.env.GATSBY_RAPID_API_KEY,
        useQueryString: "true",
      },
    }
  );
  return response.blob();
};
