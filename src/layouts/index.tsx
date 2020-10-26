import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Link from "gatsby-link";

import "../style/index.scss";

const Layout = ({ children }) => {
  // const connectWallet = useCallback(() => {
  //   if (!wallet || wallet.account) {
  //     return;
  //   }
  //   wallet.connect("injected");
  // }, [wallet]);

  // const userAddress = useCallback(() => {
  //   if (!wallet || !wallet.account) {
  //     return "";
  //   }
  //   return `${wallet.account.substr(0, 5)}...${wallet.account.substr(
  //     wallet.account.length - 5,
  //     5
  //   )}`;
  // }, [wallet]);

  return (
    <div>
      <Helmet title="Rent NFT" />
      <div className="Container">
        <div className="Header">
          <div className="Wrap">
            <div className="Header__body">
              <h1 className="Header__title">
                {/* <Link data-text={site.siteMetadata.siteName} to="/">
                  {site.siteMetadata.siteName}
                </Link> */}
              </h1>
              {/* <div className="Header__summary" onClick={connectWallet}>
                {userAddress() !== "" ? userAddress() : "Connect to Görli"}
              </div> */}
              <div className="Header__summary snipcart-summary snipcart-checkout">
                <div className="Header__summary__title">🛍 MY NFT CART 🛍</div>
                <div className="Header__summary__line">
                  Number of items:{" "}
                  <span className="snipcart-total-items"></span>
                </div>
                <div className="Header__summary__line">
                  Total rent price:{" "}
                  <span className="snipcart-total-price"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="Wrap">{children}</div>
        <div className="Footer" style={{ textAlign: "center" }}>
          ♦ See me in openverse soon... ♦
        </div>
      </div>
    </div>
  );
};

export default Layout;