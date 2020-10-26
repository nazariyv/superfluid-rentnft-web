import React, { useState, useCallback } from "react";
import { StaticQuery, graphql } from "gatsby";
import { Box } from "@material-ui/core";
import { useWallet } from "use-wallet";

import ShadowScrollbars from "./ShadowScrollbars";
import Layout from "../layouts/index";
import Psychedelic from "./Psychedelic";
import ComingSoon from "./ComingSoon";
import ButHow from "./ButHow";
import DappContext from "../contexts/Dapp";
import Stats from "./Stats";
import { getGanFace } from "../api/ganFace";

export default () => {
  const [activeTab, setActiveTab] = useState("RENT");
  const wallet = useWallet();
  const setTab = useCallback(
    (tab) => {
      return () => setActiveTab(tab);
    },
    [setActiveTab]
  );
  const getFace = useCallback(async () => {
    // const face = await getGanFace();
    // console.error("face");
    // console.error(face);
    // const url = URL.createObjectURL(face);
    // const img = document.getElementById('face');
    // img.src = url;
  }, [getGanFace]);

  return (
    <DappContext.Provider value={{wallet}}>
      <StaticQuery
        query={graphql`
          query CatalogueQuery {
            allCustomApi {
              edges {
                node {
                  assets {
                    asset_contract {
                      address
                      asset_contract_type
                      created_date(fromNow: true)
                      description
                    }
                    token_id
                    image_original_url
                  }
                }
              }
            }
            site {
              siteMetadata {
                siteName
              }
            }
          }
        `}
        render={(data) => (
            <Layout>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "0 0 32px 0",
                }}
              >
                {/* <div role="button" onClick={getFace} style={{backgroundColor: "green", cursor: "pointer"}}>
                  Click me
                </div>
                <div className="Product__image"><img id="face"></img></div> */}
                <div
                  role="button"
                  style={{ marginRight: "16px" }}
                  onClick={setTab("RENT")}
                  onKeyDown={setTab("RENT")}
                >
                  <span
                    className={
                      activeTab === "RENT" ? "active-tab" : "Product__button"
                    }
                  >
                    Rent NFT
                  </span>
                </div>
                <div
                  role="button"
                  style={{ marginRight: "16px" }}
                  onClick={setTab("LEND")}
                  onKeyDown={setTab("LEND")}
                >
                  <span
                    className={
                      activeTab === "LEND" ? "active-tab" : "Product__button"
                    }
                  >
                    Lend NFT
                  </span>
                </div>
                <div
                  role="button"
                  style={{ marginRight: "16px" }}
                  onClick={setTab("STATS")}
                  onKeyDown={setTab("STATS")}
                >
                  <span
                    className={
                      activeTab === "STATS" ? "active-tab" : "Product__button"
                    }
                  >
                    My Stats
                  </span>
                </div>
                <div
                  role="button"
                  style={{ marginRight: "16px" }}
                  onClick={setTab("LEADER")}
                  onKeyDown={setTab("LEADER")}
                >
                  <span
                    className={
                      activeTab === "LEADER" ? "active-tab" : "Product__button"
                    }
                  >
                    Leaderboard
                  </span>
                </div>
                <div
                  role="button"
                  onClick={setTab("HOW")}
                  onKeyDown={setTab("HOW")}
                >
                  <span
                    className={
                      activeTab === "HOW" ? "active-tab" : "Product__button"
                    }
                  >
                    But How?!
                  </span>
                </div>
              </div>
              <ShadowScrollbars style={{height: "800px"}}>
                <Box
                  style={{
                    padding: "32px 64px",
                    border: "3px solid black",
                  }}
                >
                  <Psychedelic
                    data={data}
                    hidden={activeTab !== "LEND"}
                    isRent={false}
                  />
                  <ComingSoon hidden={activeTab !== "LEADER"} />
                  <ButHow hidden={activeTab !== "HOW"} />
                  <Stats hidden={activeTab !== "STATS"} />
                </Box>
              </ShadowScrollbars>
            </Layout>
        )}
      />
    </DappContext.Provider>
  );
};