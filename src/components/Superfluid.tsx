import { useContext, useEffect, useState, useCallback, useMemo } from "react";
// @ts-ignore
import SuperfluidSDK from "@superfluid-finance/ethereum-contracts";

import DappContext from "../contexts/Dapp";
import { addresses, abis } from "../contracts";
import { Address } from "types";

const useSuperfluid = () => {
  const { web3, wallet } = useContext(DappContext);
  const [sf, setSf] = useState({});
  const [successfulInit, setSuccessfulInit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initSf = useCallback(async (_sf) => {
    try {
      await _sf.initialize();
      // * ensure that the above throws if unsuccessful
      // * if it supresses the unssuccessful init, then
      // * this logic is invalid
      setSuccessfulInit(true);
      setSf(_sf);

      console.log("successful init");
    } catch (err) {
      console.debug("could not initialize Superfluid");
      setSuccessfulInit(false);
    }
  }, []);

  useEffect(() => {
    if (!web3 || successfulInit) return;

    setIsLoading(true);
    const sfVal = new SuperfluidSDK.Framework({
      version: "0.1.2-preview-20201014",
      web3Provider: web3.currentProvider,
    });
    initSf(sfVal);
    setIsLoading(false);
  }, [web3, successfulInit, initSf]);

  // todo: bad code. also superfluid sdk must have a util for this
  const perMonth = useCallback(
    (perDayAmt: number): string => {
      if (!web3) return "";
      return web3.utils.toWei(String(perDayAmt * 3600 * 24 * 30), "ether");
    },
    [web3]
  );

  // todo: bad hardcoded code
  const createFlow = useCallback(
    async (to: Address, rate: string) => {
      const res = await sf.host.callAgreement(
        sf.agreements.cfa.address,
        sf.agreements.cfa.contract.methods
          .createFlow(addresses.goerli.daix, to, rate, "0x")
          .encodeABI(),
        { from: wallet?.account }
      );

      return res;
    },
    [sf, wallet?.account]
  );

  const updateFlow = useCallback(async () => {}, []);

  const deleteFlow = useCallback(async () => {}, []);

  const tradeableCashflow = useMemo(() => {
    if (!web3) return;
    const contract = new web3.eth.Contract(abis.goerli.tradeableCashflow.abi);
    return contract;
  }, [web3]);

  // const mvp = useCallback(async () => {
  // if (!sf || !wallet) return;
  // const daiAddress = await sf.resolver.get("tokens.fDAI");
  // console.log("daiAddres", daiAddress);
  // const dai = await sf.contracts.TestToken.at(daiAddress);
  // console.log("dai", dai);
  // await dai.mint(wallet?.account, web3?.utils.toWei("1000", "ether"), {
  //   from: wallet?.account,
  // });
  // console.log("minted");
  // const daixWrapper = await sf.getERC20Wrapper(dai);
  // console.log("daixWrapper", daixWrapper);
  // const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress);
  // console.log("daix", daix);
  // await dai.approve(daix.address, "1" + "0".repeat(42), {
  //   from: wallet?.account,
  // });
  // console.log("dai approved daix");
  // await daix.upgrade(web3?.utils.toWei("50", "ether"), {
  //   from: wallet?.account,
  // });
  // console.log("dai upgraded to daix");
  // const res = await sf.host.callAgreement(
  //   sf.agreements.cfa.address,
  //   sf.agreements.cfa.contract.methods
  //     .createFlow(
  //       daix.address,
  //       "0xF2CfffD0D154805503E9D16C4832f960DEDa03fF",
  //       "38580246913580",
  //       "0x"
  //     )
  //     .encodeABI(),
  //   { from: wallet?.account }
  // );
  // console.log("cfa created", res);
  // }, [sf, wallet, web3?.utils]);

  return {
    // mvp,
    sf,
    tradeableCashflow,
    perMonth,
    createFlow,
    updateFlow,
    deleteFlow,
  };
};

export default useSuperfluid;
