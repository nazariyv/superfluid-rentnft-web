import React, { useState, useCallback } from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { Box } from "@material-ui/core"
import ShadowScrollbars from "../components/ShadowScrollbars"
import Layout from "../layouts/index"
import Psychedelic from "../components/Psychedelic"
import ComingSoon from '../components/ComingSoon'

export default () => {
  const [activeTab, setActiveTab] = useState("RENT");
  const setTab = useCallback((tab) => {
    return () => setActiveTab(tab);
  }, [setActiveTab]);
  console.log(activeTab)

  return (<StaticQuery
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
    render={data => (
      <>
        <Layout site={data.site}>
          <Box style={{display: "flex", flexDirection: "row", padding: "0 0 32px 0"}}>
            <div role="button" style={{marginRight: "16px"}} onClick={setTab("RENT")} onKeyDown={setTab("RENT")}>
              <span className={activeTab === "RENT" ? "active-tab" : "Product__button"}>Rent NFT</span>
            </div>
            <div role="button" style={{marginRight: "16px"}} onClick={setTab("LEND")} onKeyDown={setTab("LEND")}>
              <span className={activeTab === "LEND" ? "active-tab" : "Product__button"}>Lend NFT</span>
            </div>
            <div role="button" style={{marginRight: "16px"}} onClick={setTab("STATS")} onKeyDown={setTab("STATS")}>
              <span className={activeTab === "STATS" ? "active-tab" : "Product__button"}>My Stats</span>
            </div>
            <div role="button" style={{marginRight: "16px"}} onClick={setTab("LEADER")} onKeyDown={setTab("STATS")}>
              <span className={activeTab === "LEADER" ? "active-tab" : "Product__button"}>Leaderboard</span>
            </div>
            <div role="button" onClick={setTab("HOW")} onKeyDown={setTab("HOW")}>
              <span className={activeTab === "HOW" ? "active-tab" : "Product__button"}>But How?!</span>
            </div>
          </Box>
            <ShadowScrollbars style={{ height: 800 }}>
              <Psychedelic data={data} hidden={activeTab !== "RENT"} />
              <ComingSoon hidden={activeTab !== "LEADER"} />
            </ShadowScrollbars>
        </Layout>
      </>
      )}
  />)
};
