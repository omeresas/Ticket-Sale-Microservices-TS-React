import buildClient from "../api/build-client";

const homePage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in!</h1>
  ) : (
    <h1>You are NOT signed in!</h1>
  );
};

homePage.getInitialProps = async (context) => {
  const response = await (
    await buildClient(context)
  ).get("/api/users/currentuser");

  return response.data;
};

export default homePage;
