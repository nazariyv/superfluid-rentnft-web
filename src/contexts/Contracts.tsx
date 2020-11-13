import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Contract } from "web3-eth-contract";

import DappContext from "./Dapp";
import { abis, addresses } from "../contracts";
import { Address } from "../types";

type ContractsContextType = {
  erc721: {
    approveAll: (nft: Address, operator: Address) => void;
  };
  erc20: {
    approve: (token: Address, spender: Address, amount: string) => void;
  };
  pmtToken: {
    dai: {
      contract?: Contract;
      approve: () => void;
    };
  };
  face: {
    contract?: Contract;
  };
  rent: {
    contract?: Contract;
    // TODO: lendOne and rentOne here need to take NFT address to generalise this
    lendOne: (
      nft: Address,
      tokenId: string,
      maxDuration: string,
      borrowPrice: string,
      nftPrice: string,
      cashflow: Address
    ) => void;
    rentOne: (nft: Address, tokenId: string, rentDuration: string) => void;
    returnOne: (nft: Address, tokenId: string) => void;
    getLastCashflow: (nft: Address) => Promise<string>;
  };
};

const DefaultContractsContext = {
  erc721: {
    approveAll: () => {
      throw new Error("must be implemented");
    },
  },
  erc20: {
    approve: () => {
      throw new Error("must be implemented");
    },
  },
  pmtToken: {
    dai: {
      approve: () => {
        throw new Error("must be implemented");
      },
    },
  },
  face: {
    // approveOfAllFaces: () => {
    //   throw new Error("must be implemented");
    // },
  },
  rent: {
    lendOne: () => {
      throw new Error("must be implemented");
    },
    rentOne: () => {
      throw new Error("must be implemented");
    },
    returnOne: () => {
      throw new Error("must be implemented");
    },
    getLastCashflow: () => {
      throw new Error("must be implemented");
    },
  },
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

// ! 1bn (18 d.p.)
const UNLIMITED_ALLOWANCE = "1000000000000000000000000000";

type ContractsProviderProps = {
  children: React.ReactNode;
};

export const ContractsProvider: React.FC<ContractsProviderProps> = ({
  children,
}) => {
  const { web3, wallet } = useContext(DappContext);
  const [face, setFace] = useState<Contract>();
  const [rent, setRent] = useState<Contract>();
  const [dai, setDai] = useState<Contract>();

  // checks that there is web3 and wallet
  // plus any additional args
  const dappOk = useCallback(
    (...args) => {
      if (!web3 || !wallet?.account) {
        console.debug("no web3 or wallet");
        return false;
      }
      for (const arg of args) {
        if (!arg) return false;
      }
      return true;
    },
    [web3, wallet]
  );

  const getDaiContract = useCallback(async () => {
    if (!dappOk()) return;
    if (dai != null) return;

    // todo: checkDapp as typeguard that web3 is not null
    const contract = new web3!.eth.Contract(
      abis.erc20.abi,
      addresses.goerli.dai
    );
    setDai(contract);
  }, [web3, dai, dappOk]);

  // * this is factory face contract now! do not approve with it
  const getFaceContract = useCallback(async () => {
    if (!dappOk()) return;
    if (face != null) return;

    const contract = new web3!.eth.Contract(
      abis.goerli.face.abi,
      addresses.goerli.face
    );
    setFace(contract);
  }, [web3, face, dappOk]);

  const getRentContract = useCallback(async () => {
    if (!dappOk()) return;
    if (rent != null) return;

    const contract = new web3!.eth.Contract(
      abis.goerli.rent.abi,
      addresses.goerli.rent
    );
    setRent(contract);
  }, [web3, rent, dappOk]);

  const getAllContracts = useCallback(async () => {
    await Promise.all([getDaiContract(), getFaceContract(), getRentContract()]);
  }, [getDaiContract, getFaceContract, getRentContract]);

  useEffect(() => {
    getAllContracts();
  }, [getAllContracts]);

  const approveAll = useCallback(
    async (nft, operator) => {
      if (!dappOk()) return;

      // todo: bad code
      const contract = new web3.eth.Contract(abis.erc721.abi, nft);
      await contract.methods
        .setApprovalForAll(operator, true)
        .send({ from: wallet?.account });
    },
    [dappOk, wallet?.account, web3]
  );

  const approve = useCallback(
    async (token, spender, amount) => {
      if (!dappOk()) return;

      const contract = new web3.eth.Contract(abis.erc20.abi, token);
      await contract.methods
        .approve(spender, amount)
        .send({ from: wallet?.account });
    },
    [dappOk, wallet?.account, web3]
  );

  // infinite approval of the payment token
  const approveDai = useCallback(async () => {
    if (!dappOk(dai)) return;

    await dai?.methods
      .approve(addresses.goerli.rent, UNLIMITED_ALLOWANCE)
      .send({ from: wallet?.account });
  }, [wallet?.account, dai, dappOk]);

  // ----------------- Contract Interaction -----------------------

  // rent one NFT
  const rentOne = useCallback(
    async (nft: Address, tokenId: string, rentDuration: string) => {
      if (!dappOk(rent)) return;

      await rent?.methods
        .rentOne(
          wallet?.account,
          nft,
          web3?.utils.hexToNumberString(tokenId),
          rentDuration,
          web3.eth.abi.encodeParameter("bytes", web3.utils.stringToHex("DAI"))
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, dappOk, web3]
  );

  // lend one NFT
  const lendOne = useCallback(
    async (
      nft: Address,
      tokenId: string,
      maxDuration: string,
      borrowPrice: string,
      nftPrice: string,
      cashflow: Address
    ) => {
      if (!dappOk(rent)) return;

      // todo: bad code

      await rent?.methods
        .lendOne(nft, tokenId, maxDuration, borrowPrice, nftPrice, cashflow)
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, dappOk]
  );

  const returnOne = useCallback(
    async (nft: Address, tokenId: string) => {
      if (!dappOk(rent)) return;

      await rent?.methods
        .returnNftOne(nft, tokenId)
        .send({ from: wallet?.account });
    },
    [dappOk, wallet?.account, rent]
  );

  const getLastCashflow = useCallback(
    async (nft: Address): Promise<string> => {
      if (!dappOk(rent)) return [];
      const cashflow = await rent?.methods.getLastCashflow(nft).call();
      return cashflow;
    },
    [dappOk, rent]
  );

  // ---------------------------------------------------------------

  return (
    <ContractsContext.Provider
      value={{
        erc721: {
          approveAll,
        },
        erc20: {
          approve,
        },
        pmtToken: {
          dai: {
            contract: dai,
            approve: approveDai,
          },
        },
        face: { contract: face },
        rent: {
          contract: rent,
          lendOne,
          rentOne,
          returnOne,
          getLastCashflow,
        },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
