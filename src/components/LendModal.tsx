import React, { useContext, useState, useCallback, useMemo } from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// contexts
import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";
import FunnySpinner from "./Spinner";
import RainbowButton from "./RainbowButton";
import Modal from "./Modal";
import CssTextField from "./CssTextField";
import { Address } from "../types";
import { addresses } from "../contracts";
// todo: this is in components, move to hooks
import useSuperfluid from "./Superfluid";

// TODO: this is a copy of what we have in RentModal
const useStyles = makeStyles({
  form: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  inputs: {
    display: "flex",
    flexDirection: "column",
    padding: "32px",
    // matches direct div children of inputs
    "& > div": {
      marginBottom: "16px",
    },
    margin: "0 auto",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

type ValueValid = {
  value: string;
  valid: boolean;
};

type LendOneInputs = {
  maxDuration: ValueValid;
  borrowPrice: ValueValid;
  nftPrice: ValueValid;
};

type LendModalProps = {
  faceId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type NftAndId = {
  nftAddress: Address;
  tokenId: string;
};

const LendModal: React.FC<LendModalProps> = ({ faceId, open, setOpen }) => {
  const classes = useStyles();
  const { rent, erc721 } = useContext(ContractsContext);
  const { web3, wallet } = useContext(DappContext);
  const { sf, createFlow, perMonth, tradeableCashflow } = useSuperfluid();

  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({
    maxDuration: {
      value: "7",
      valid: true,
    },
    borrowPrice: {
      value: "10",
      valid: true,
    },
    nftPrice: {
      value: "100",
      valid: true,
    },
  });

  const nftAndId: NftAndId = useMemo(() => {
    const parts = faceId.split("::");
    if (parts.length < 2) {
      return {
        nftAddress: "",
        tokenId: "",
      };
    }
    return {
      nftAddress: parts[0],
      tokenId: parts[1],
    };
  }, [faceId]);

  const [isBusy, setIsBusy] = useState(false);

  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!web3 || !wallet?.account) return;

      setIsBusy(true);
      try {
        // create tradeable cashflow NFT and send to yourself
        // send the actual NFT you want to lend to our contract

        // todo: ouch expensive and ouch awful code
        const res = await tradeableCashflow
          ?.deploy({
            data: "0x",
            arguments: [
              wallet?.account,
              "FranTradeableCashflow",
              "TCF",
              sf.host.address,
              sf.agreements.cfa.address,
              addresses.goerli.daix,
            ],
          })
          .send({ from: wallet?.account });
        const cashflowAddress = res._address;

        // now take the address of the flow above and supply it to rent NFT (so that we can compute stats later on)
        await rent.lendOne(
          nftAndId.nftAddress,
          nftAndId.tokenId,
          lendOneInputs.maxDuration.value,
          web3.utils.toWei(Number(lendOneInputs.borrowPrice.value).toFixed(18)),
          web3.utils.toWei(
            Number(lendOneInputs.nftPrice.value).toFixed(18),
            "ether"
          ),
          cashflowAddress
        );
      } catch (err) {
        // ! TODO: NOTIFICATION THAT SOMETHING WENT WRONG
        // TRELLO TASK: https://trello.com/c/FUhFdVR4/48-2-add-notifications-anywhere-you-can
        console.debug("could not complete the lending");
      }

      // show green check mark somewhere too
      setIsBusy(false);
      setOpen(false);
    },
    [
      lendOneInputs,
      web3,
      wallet,
      rent,
      setOpen,
      sf,
      tradeableCashflow,
      nftAndId,
    ]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ! this wasted an hour of my life: https://duncanleung.com/fixing-react-warning-synthetic-events-in-setstate/
    e.persist();
    const target = e.target.name;
    const val = e.target.value;

    let valid = true;
    if (target === "maxDuration") {
      valid = checkMaxDuration(val);
    } else if (target === "borrowPrice" || target === "nftPrice") {
      valid = checkPrice(val);
    }

    // ! if setting the state based on the previous state values, you should use a function
    setLendOneInputs((lendOneInputs) => ({
      ...lendOneInputs,
      [target]: {
        value: val,
        valid,
      },
    }));
  };

  const checkPrice = (n: string) => {
    return n !== "" && Number(n) >= 0;
  };

  const checkMaxDuration = (n: string) => {
    return !n.includes(".") && checkPrice(n);
  };

  const allValid = useMemo(() => {
    return Object.values(lendOneInputs).every((item) => item.valid);
  }, [lendOneInputs]);

  // this will ensure that spinner halts if the user rejects the txn
  const handleApproveAll = useCallback(async () => {
    setIsBusy(true);

    try {
      await erc721.approveAll(nftAndId.nftAddress, addresses.goerli.rent);
    } catch (e) {
      console.error(e);
      console.debug("could not approve all the faces");
    }

    setIsBusy(false);
  }, [erc721, nftAndId.nftAddress]);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const preventDefault = (e: React.FormEvent) => e.preventDefault();

  return (
    <Modal open={open} handleClose={handleClose}>
      <form
        noValidate
        autoComplete="off"
        onSubmit={handleLend}
        className={classes.form}
        style={{ padding: "32px" }}
      >
        <Box className={classes.inputs}>
          <CssTextField
            required
            error={!lendOneInputs.maxDuration.valid}
            label="Max lend duration"
            id="maxDuration"
            variant="outlined"
            value={lendOneInputs.maxDuration.value}
            type="number"
            helperText={
              !lendOneInputs.maxDuration.valid ? "Must be a natural number" : ""
            }
            onChange={handleChange}
            name="maxDuration"
            disabled={isBusy}
          />
          <CssTextField
            required
            error={!lendOneInputs.borrowPrice.valid}
            label="Borrow Price"
            id="borrowPrice"
            variant="outlined"
            value={lendOneInputs.borrowPrice.value}
            type="number"
            helperText={
              !lendOneInputs.borrowPrice.valid
                ? "Must be a zero or a positive decimal"
                : ""
            }
            onChange={handleChange}
            name="borrowPrice"
            disabled={isBusy}
          />
          <CssTextField
            required
            error={!lendOneInputs.nftPrice.valid}
            label="Collateral"
            id="nftPrice"
            variant="outlined"
            value={lendOneInputs.nftPrice.value}
            type="number"
            helperText={
              !lendOneInputs.nftPrice.valid
                ? "Must be a zero or a positive decimal"
                : ""
            }
            onChange={handleChange}
            name="nftPrice"
            disabled={isBusy}
          />
        </Box>
        <Box>{isBusy && <FunnySpinner />}</Box>
        <Box className={classes.buttons}>
          <button
            type="button"
            style={{
              border: "3px solid black",
            }}
            className="Product__button"
            onClick={handleApproveAll}
            onSubmit={preventDefault}
            disabled={isBusy}
          >
            Approve all
          </button>
          <Box>
            <RainbowButton
              type="submit"
              text="Lend"
              disabled={isBusy || !allValid}
            />
          </Box>
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
