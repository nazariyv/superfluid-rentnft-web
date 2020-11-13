import face from "./abis/goerli/GanFaceFactory.json";
import tradeableCashflow from "./abis/goerli/TradeableCashflow.json";
import rent from "./abis/goerli/RentNft.json";
import erc20 from "./abis/ERC20.json";
import erc721 from "./abis/IERC721.json";

export const abis = {
  erc20,
  erc721,
  goerli: {
    face,
    rent,
    tradeableCashflow,
  },
};
