import axios from "axios";

const homePage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Home Page!</h1>;
};

homePage.getInitialProps = async () => {
  const response = await axios.get("/api/users/currentuser");

  return response.data;
};

export default homePage;
