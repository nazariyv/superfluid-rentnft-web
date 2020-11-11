export const getGanFace = async () => {
  const response = await fetch(
    "https://face-generator.p.rapidapi.com/faces/random",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "face-generator.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        useQueryString: "true",
      },
    }
  );
  return response.blob();
};
