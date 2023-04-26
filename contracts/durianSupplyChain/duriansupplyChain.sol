// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "../ownership/Ownable.sol";
import "../access/HarvesterRole.sol";
import "../access/DistributorRole.sol";
import "../access/RetailerRole.sol";
import "../access/ConsumerRole.sol";

contract durianSupplyChain is HarvesterRole, DistributorRole, RetailerRole, ConsumerRole {
    address public owner;

    HarvesterRole harvesterRole;

    uint256 public stockUnit = 0;

    mapping(uint256 => durian) durians;

    mapping(uint256 => Txblocks) duriansHistory;

    enum State {
        ProduceByHarvester, // 0
        ForSaleByHarvester, // 1
        PurchasedByDistributor, // 2
        ShippedByHarvester, // 3
        ReceivedByDistributor, // 4
        ProcessedByDistributor, // 5
        // PackageByDistributor, // 6
        ForSaleByDistributor, // 7
        PurchasedByRetailer, // 8
        ShippedByDistributor, // 9
        ReceivedByRetailer, // 10
        ForSaleByRetailer, // 11
        PurchasedByConsumer, // 12
        RatingByConsumer // 13
    }

    State constant defaultState = State.ProduceByHarvester;

    uint256[] public durianCodeArray;

    // Define a struct 'durian' with the following fields:
    struct durian {
        address ownerID;
        uint256 durianCode;
        uint256 durianWeight;
        string durianType;
        uint256 harvestedDurianPrice;
        address harvesterID;
        uint256 harvestedTime;
        string harvestLocationAddress;
        State durianState;
        address distributorID;
        uint256 distributedDurianPrice;
        bool packaging;
        uint256 piecesFlesh;
        uint256 distributedTime;
        address retailerID;
        uint256 retailerDurianPrice;
        uint256 retailedTime;
        address consumerID;
        uint256 consumerBoughtTime;
        uint8 taste;
        uint8 condition;
        uint8 fragrance;
        uint8 creaminess;
        uint8 ripeness;
    }

    // Block number stuct
    struct Txblocks {
        uint256 HTD; // blockHarvesterToDistributor
        uint256 DTR; // blockDistributorToRetailer
        uint256 RTC; // blockRetailerToConsumer
    }

    event ProduceByHarvester(uint256 durianCode); //1
    event ForSaleByHarvester(uint256 durianCode); //2
    event PurchasedByDistributor(uint256 durianCode); //3
    event ShippedByHarvester(uint256 durianCode); //4
    event ReceivedByDistributor(uint256 durianCode); //5
    event ProcessedByDistributor(uint256 durianCode); //6
    // event PackagedByDistributor(uint256 durianCode); //7
    event ForSaleByDistributor(uint256 durianCode); //8
    event PurchasedByRetailer(uint256 durianCode); //9
    event ShippedByDistributor(uint256 durianCode); //10
    event ReceivedByRetailer(uint256 durianCode); //11
    event ForSaleByRetailer(uint256 durianCode); //12
    event PurchasedByConsumer(uint256 durianCode); //13
    event RatingByConsumer(uint256 durianCode); //14

    modifier only_Owner() {
        require(_msgSender() == owner, "Only the owner can perform this action.");
        _;
    }

    modifier verifyCaller(address _address) {
        require(_msgSender() == _address, "Only the verified caller can perform this action.");
        _;
    }

    //Durian State Modifiers
    modifier produceByHarvester(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ProduceByHarvester,
            "Durian is not in the ProduceByHarvester state."
        );
        _;
    }

    modifier forSaleByHarvester(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ForSaleByHarvester,
            "Durian is not in the ForSaleByHarvester state."
        );
        _;
    }

    modifier purchasedByDistributor(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.PurchasedByDistributor,
            "Durian is not in the PurchasedByDistributor state."
        );
        _;
    }

    modifier shippedByHarvester(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ShippedByHarvester,
            "Durian is not in the ShippedByHarvester state."
        );
        _;
    }

    modifier receivedByDistributor(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ReceivedByDistributor,
            "Durian is not in the ReceivedByDistributor state."
        );
        _;
    }

    modifier processByDistributor(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ProcessedByDistributor,
            "Durian is not in the ProcessedByDistributor state."
        );
        _;
    }

    // modifier packagedByDistributor(uint256 _durianCode) {
    //     require(durians[_durianCode].durianState == State.PackageByDistributor, "Durian is not in the PackageByDistributor state.");
    //     _;
    // }

    modifier forSaleByDistributor(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ForSaleByDistributor,
            "Durian is not in the ForSaleByDistributor state."
        );
        _;
    }

    modifier shippedByDistributor(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ShippedByDistributor,
            "Durian is not in the ShippedByDistributor state."
        );
        _;
    }

    modifier purchasedByRetailer(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.PurchasedByRetailer,
            "Durian is not in the PurchasedByRetailer state."
        );
        _;
    }

    modifier receivedByRetailer(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ReceivedByRetailer,
            "Durian is not in the ReceivedByRetailer state."
        );
        _;
    }

    modifier forSaleByRetailer(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.ForSaleByRetailer,
            "Durian is not in the ForSaleByRetailer state."
        );
        _;
    }

    modifier purchasedByConsumer(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.PurchasedByConsumer,
            "Durian is not in the PurchasedByConsumer state."
        );
        _;
    }

    modifier ratingByConsumer(uint256 _durianCode) {
        require(
            durians[_durianCode].durianState == State.RatingByConsumer,
            "Durian is not in the RatingByConsumer state."
        );
        _;
    }

    modifier paidEnough(uint256 _price) {
        require(msg.value >= _price, "Insufficient funds sent");
        _;
    }

    modifier durianExists(uint256 _durianCode) {
        require(
            durians[_durianCode].durianCode == _durianCode,
            "Durian with the given code does not exist"
        );
        _;
    }

    modifier checkValue(uint256 _price, address payable addressToFund) {
        require(msg.value >= _price, "Insufficient funds sent");
        uint256 amountToReturn = msg.value - _price;
        addressToFund.transfer(amountToReturn);
        _;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() payable {
        owner = _msgSender();
        // durianCode = 1;
    }

    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    function kill() public {
        if (_msgSender() == owner) {
            address payable ownerAddressPayable = _make_payable(owner);
            selfdestruct(ownerAddressPayable);
        }
    }

    // 1st step in supply chain process
    function produceDurianByHarvester(
        uint256 _durianCode,
        uint256 _durianWeight,
        string memory _durianType,
        string memory _harvestLocationAddress
    ) public onlyHarvester {
        address distributorID;
        address retailerID;
        address consumerID;
        durian memory newProduce;
        newProduce.ownerID = _msgSender();
        newProduce.durianCode = _durianCode;
        newProduce.harvesterID = _msgSender();
        newProduce.durianWeight = _durianWeight;
        newProduce.durianType = _durianType;
        newProduce.harvestLocationAddress = _harvestLocationAddress;
        newProduce.harvestedTime = block.timestamp;
        newProduce.harvestedDurianPrice = _durianWeight * 0.005 ether;
        newProduce.durianState = defaultState;
        newProduce.distributorID = distributorID;
        newProduce.retailerID = retailerID;
        newProduce.consumerID = consumerID;
        durians[_durianCode] = newProduce;
        uint256 placeholder;
        Txblocks memory txBlock;
        txBlock.HTD = placeholder;
        txBlock.DTR = placeholder;
        txBlock.RTC = placeholder;
        duriansHistory[_durianCode] = txBlock;

        durianCodeArray.push(_durianCode);

        // Increment stockUnit
        stockUnit = stockUnit + 1;

        // Emit the appropriate event
        emit ProduceByHarvester(_durianCode);
    }

    //2nd step of suppply chain process
    function sellDurianByHarvester(
        uint256 _durianCode
    )
        public
        onlyHarvester
        produceByHarvester(_durianCode)
        durianExists(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].durianState = State.ForSaleByHarvester;
        emit ForSaleByHarvester(_durianCode);
    }

    // 3rd step of suppply chain process
    function purchaseDurianByDistributor(
        uint256 _durianCode
    )
        public
        payable
        onlyDistributor
        forSaleByHarvester(_durianCode)
        paidEnough(durians[_durianCode].harvestedDurianPrice)
        checkValue(durians[_durianCode].harvestedDurianPrice, payable(_msgSender()))
    {
        address payable ownerAddressPayable = _make_payable(durians[_durianCode].harvesterID); // make originFarmID payable
        ownerAddressPayable.transfer(durians[_durianCode].harvestedDurianPrice);
        durians[_durianCode].ownerID = _msgSender();
        durians[_durianCode].distributorID = _msgSender();
        durians[_durianCode].durianState = State.PurchasedByDistributor;
        duriansHistory[_durianCode].HTD = block.number;
        emit PurchasedByDistributor(_durianCode);
    }

    // 4th step in supply chain process
    function shippedDurianByHarvester(
        uint256 _durianCode
    )
        public
        // payable
        onlyHarvester
        purchasedByDistributor(_durianCode)
        verifyCaller(durians[_durianCode].harvesterID)
    {
        durians[_durianCode].durianState = State.ShippedByHarvester;
        emit ShippedByHarvester(_durianCode);
    }

    // 5th step in supply chain process
    function receivedDurianByDistributor(
        uint256 _durianCode
    )
        public
        onlyDistributor
        shippedByHarvester(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].distributedTime = block.timestamp;
        durians[_durianCode].durianState = State.ReceivedByDistributor;
        emit ReceivedByDistributor(_durianCode);
    }

    // 6th step in supply chain process
    function processedDurianByDistributor(
        uint256 _durianCode,
        bool _packaging,
        uint256 _piecesFlesh
    )
        public
        onlyDistributor
        receivedByDistributor(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].packaging = _packaging;
        if (_packaging == false) {
            durians[_durianCode].piecesFlesh = 0;
        } else {
            durians[_durianCode].piecesFlesh = _piecesFlesh;
        }
        durians[_durianCode].durianState = State.ProcessedByDistributor;
        emit ProcessedByDistributor(_durianCode);
    }

    // 7th step in supply chain process
    // function packageDurianByDistributor(uint256 _durianCode)
    //     public
    //     onlyDistributor // check _msgSender() belongs to DistributorRole
    //     processByDistributor(_durianCode)
    //     verifyCaller(durians[_durianCode].ownerID) // check _msgSender() is owner
    // {
    //     durians[_durianCode].durianState = State.PackageByDistributor;
    //     emit PackagedByDistributor(_durianCode);
    // }

    // 8th step in supply chain process
    function sellDurianByDistributor(
        uint256 _durianCode,
        uint256 _price
    )
        public
        onlyDistributor
        processByDistributor(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].durianState = State.ForSaleByDistributor;
        durians[_durianCode].distributedDurianPrice = _price;
        emit ForSaleByDistributor(_durianCode);
    }

    // 9th step in supply chain process
    function purchaseDurianByRetailer(
        uint256 _durianCode
    )
        public
        payable
        onlyRetailer
        forSaleByDistributor(_durianCode)
        paidEnough(durians[_durianCode].distributedDurianPrice)
        checkValue(_durianCode, payable(_msgSender()))
    {
        address payable ownerAddressPayable = _make_payable(durians[_durianCode].distributorID);
        ownerAddressPayable.transfer(durians[_durianCode].distributedDurianPrice);
        durians[_durianCode].ownerID = _msgSender();
        durians[_durianCode].retailerID = _msgSender();
        durians[_durianCode].durianState = State.PurchasedByRetailer;
        duriansHistory[_durianCode].DTR = block.number;
        emit PurchasedByRetailer(_durianCode);
    }

    // 10th step in supply chain process
    function shippedDurianByDistributor(
        uint256 _durianCode
    )
        public
        onlyDistributor
        purchasedByRetailer(_durianCode)
        verifyCaller(durians[_durianCode].distributorID)
    {
        durians[_durianCode].durianState = State.ShippedByDistributor;
        emit ShippedByDistributor(_durianCode);
    }

    // 11th step in supply chain process
    function receivedDurianByRetailer(
        uint256 _durianCode
    )
        public
        onlyRetailer
        shippedByDistributor(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].retailedTime = block.timestamp;
        durians[_durianCode].durianState = State.ReceivedByRetailer;
        emit ReceivedByRetailer(_durianCode);
    }

    // 12th step in supply chain process
    function sellDurianByRetailer(
        uint256 _durianCode,
        uint256 _price
    )
        public
        onlyRetailer
        receivedByRetailer(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].durianState = State.ForSaleByRetailer;
        durians[_durianCode].retailerDurianPrice = _price;
        emit ForSaleByRetailer(_durianCode);
    }

    // 13th step in supply chain process
    function purchaseDurianByConsumer(
        uint256 _durianCode
    )
        public
        payable
        // onlyConsumer
        forSaleByRetailer(_durianCode)
        paidEnough(durians[_durianCode].retailerDurianPrice)
        checkValue(durians[_durianCode].retailerDurianPrice, payable(_msgSender()))
    {
        durians[_durianCode].consumerID = _msgSender();
        address payable ownerAddressPayable = _make_payable(durians[_durianCode].retailerID);
        ownerAddressPayable.transfer(durians[_durianCode].retailerDurianPrice);
        durians[_durianCode].ownerID = _msgSender();
        durians[_durianCode].consumerID = _msgSender();
        durians[_durianCode].durianState = State.PurchasedByConsumer;
        duriansHistory[_durianCode].RTC = block.number;
        emit PurchasedByConsumer(_durianCode);
    }

    // 14th step in supply chain process
    function rateDurianFromConsumer(
        uint256 _durianCode,
        uint8 _taste,
        uint8 _condition,
        uint8 _fragrance,
        uint8 _creaminess,
        uint8 _ripeness
    )
        public
        // onlyConsumer
        purchasedByConsumer(_durianCode)
        verifyCaller(durians[_durianCode].ownerID)
    {
        durians[_durianCode].taste = _taste;
        durians[_durianCode].condition = _condition;
        durians[_durianCode].fragrance = _fragrance;
        durians[_durianCode].creaminess = _creaminess;
        durians[_durianCode].ripeness = _ripeness;
        durians[_durianCode].durianState = State.RatingByConsumer;
        emit PurchasedByConsumer(_durianCode);
    }

    // Define a function 'fetchDurianBufferOne' that fetches the data
    function fetchDurianBufferOne(
        uint256 _durianCode
    )
        public
        view
        returns (
            uint256 durianToCode,
            address ownerID,
            string memory HarvestLocationAddress,
            uint256 harvestedTime,
            State durianState,
            uint256 durianCurrentPriceState,
            string memory durianType
        )
    {
        // Assign values to the 8 parameters
        durian memory Durian = durians[_durianCode];
        uint256 durianCurrentPrice = displayCurrentPrice(_durianCode);
        return (
            Durian.durianCode,
            Durian.ownerID,
            Durian.harvestLocationAddress,
            Durian.harvestedTime,
            Durian.durianState,
            durianCurrentPrice,
            Durian.durianType
        );
    }

    // Define a function 'fetchDurianBufferTwo' that fetches the data
    function fetchDurianBufferTwo(
        uint256 _durianCode
    )
        public
        view
        returns (
            uint256 durianToCode,
            address ownerID,
            uint8 taste,
            uint8 condition,
            uint8 fragrance,
            uint8 creaminess,
            uint8 ripeness
        )
    {
        // Assign values to the 8 parameters
        durian memory Durian = durians[_durianCode];
        return (
            Durian.durianCode,
            Durian.ownerID,
            Durian.taste,
            Durian.condition,
            Durian.fragrance,
            Durian.creaminess,
            Durian.ripeness
        );
    }

    function displayCurrentPrice(uint256 _durianCode) public view returns (uint256 durianPrice) {
        durian memory Durian = durians[_durianCode];
        if (Durian.retailerDurianPrice != 0) {
            return Durian.retailerDurianPrice;
        } else if (Durian.distributedDurianPrice != 0) {
            return Durian.distributedDurianPrice;
        } else if (Durian.harvestedDurianPrice != 0) {
            return Durian.harvestedDurianPrice;
        } else {
            return 0;
        }
    }

    // Define a function 'fetchDurianHistory' that fetaches the data
    function fetchDurianHistory(
        uint256 _durianCode
    )
        public
        view
        returns (
            uint256 blockHarvesterToDistributor,
            uint256 blockDistributorToRetailer,
            uint256 blockRetailerToConsumer
        )
    {
        // Assign value to the parameters
        Txblocks memory txblock = duriansHistory[_durianCode];
        return (txblock.HTD, txblock.DTR, txblock.RTC);
    }

    /// Define a public function to transfer ownership
    function transferOwnership(address newOwner) public only_Owner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /// Define an internal function to transfer ownership
    function _transferOwnership(address newOwner) internal {
        address oldOwner = owner;
        owner = newOwner;
        addDistributor(newOwner);
        addHarvester(newOwner);
        addRetailer(newOwner);
        removeDistributor(oldOwner);
        removeHarvester(oldOwner);
        removeRetailer(oldOwner);

        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function isOwner(address _owner) public view returns (bool) {
        return owner == _owner;
    }

    function getStockUnit() public view returns (uint256) {
        return stockUnit;
    }

    function getAllDurianCodes() public view returns (uint256[] memory) {
        uint256[] memory codes = new uint256[](durianCodeArray.length);
        for (uint i = 0; i < durianCodeArray.length; i++) {
            codes[i] = durianCodeArray[i];
        }
        return codes;
    }
}
