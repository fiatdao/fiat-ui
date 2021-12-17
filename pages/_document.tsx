import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render = () => {
    return (
      <Html lang="en">
        <Head>
          <link color="#5bbad5" href="/favicon/safari-pinned-tab.svg" rel="mask-icon" />
          <meta content="#da532c" name="msapplication-TileColor" />
          <meta content="#ffffff" name="theme-color" />
          <meta content="description" name="" />
          <meta content="" property="og:title" />
          <meta content="https://THE_URL" property="og:url" />
          <meta content="https://THE_URL/shareable/ogImage.jpg" property="og:image" />
          <meta content="website" property="og:type" />
          <meta content="" property="og:description" />
          <meta content="summary_large_image" name="twitter:card" />
          <meta content="THE_SITE" name="twitter:site" />
          <meta content="@THE_HANDLE" name="twitter:creator" />
          <link href="https://fonts.googleapis.com" rel="preconnect" />
          <link crossOrigin="crossorigin" href="https://fonts.gstatic.com" rel="preconnect" />
          <link
            href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <div id="modals" />
      </Html>
    )
  }
}
