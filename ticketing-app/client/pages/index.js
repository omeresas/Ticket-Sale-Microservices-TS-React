import buildClient from "../api/build-client";

const homePage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Home Page!</h1>;
};

homePage.getInitialProps = async (context) => {
  const response = await (
    await buildClient(context)
  ).get("/api/users/currentuser");

  return response.data;
};

export default homePage;
