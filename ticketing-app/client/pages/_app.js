import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

export default function AppComponent({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}

AppComponent.getInitialProps = async (appContext) => {
  const response = await (
    await buildClient(appContext.ctx)
  ) // how you get context in main app components in Next.js
    .get("/api/users/currentuser");

  let pageProps = {};

  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return { pageProps, currentUser: response.data.currentUser };
};
