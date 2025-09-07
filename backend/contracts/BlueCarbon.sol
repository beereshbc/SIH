// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title BlueCarbon - Optimized for Pinata workflow
/// @notice Users/NGOs submit tree planting info with IPFS hashes; admin approves and issues carbon credits
contract BlueCarbon {

    // ------------------------------------
    // STRUCTS
    // ------------------------------------
    struct Image {
        string ipfsHash;    // IPFS hash of image
        string latitude;    // GPS latitude
        string longitude;   // GPS longitude
        uint256 timestamp;  // Timestamp of planting (ms)
    }

    struct PlantingSubmission {
        address ngoWallet;     // Wallet of submitting NGO
        string title;          // Project title
        string description;    // Project description
        string ecosystem;      // Ecosystem type
        string location;       // Specific location
        uint256 areaRestored;  // Area restored in hectares
        uint256 carbonStored;  // CO2 stored in kg
        uint256 treesPlanted;  // Number of trees
        Image[] images;        // Array of images (IPFS hashes + GPS)
        string status;         // "pending", "approved", "rejected"
        uint256 submittedAt;   // Timestamp of submission
        bool exists;           // Check if submission exists
    }

    // ------------------------------------
    // STATE VARIABLES
    // ------------------------------------
    address public admin;
    uint256 public submissionCount;

    mapping(uint256 => PlantingSubmission) public submissions;          // submissionId => submission
    mapping(address => uint256[]) public ngoSubmissions;               // NGO wallet => submissionIds
    mapping(address => uint256) public carbonCredits;                  // NGO wallet => total carbon credits

    // ------------------------------------
    // EVENTS
    // ------------------------------------
    event SubmissionCreated(uint256 submissionId, address ngoWallet);
    event SubmissionApproved(uint256 submissionId, address ngoWallet, uint256 credits);
    event SubmissionRejected(uint256 submissionId, address ngoWallet);

    // ------------------------------------
    // MODIFIERS
    // ------------------------------------
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    // ------------------------------------
    // CONSTRUCTOR
    // ------------------------------------
    constructor() {
        admin = msg.sender;
    }

    // ------------------------------------
    // USER FUNCTIONS
    // ------------------------------------

    /// @notice Submit a tree planting project (IPFS images already uploaded to Pinata)
    function submitPlanting(
        string memory _title,
        string memory _description,
        string memory _ecosystem,
        string memory _location,
        uint256 _areaRestored,
        uint256 _carbonStored,
        uint256 _treesPlanted,
        string[] memory _ipfsHashes,
        string[] memory _latitudes,
        string[] memory _longitudes,
        uint256[] memory _timestamps
    ) public {
        require(
            _ipfsHashes.length == _latitudes.length &&
            _latitudes.length == _longitudes.length &&
            _longitudes.length == _timestamps.length,
            "Array length mismatch"
        );

        submissionCount++;
        PlantingSubmission storage submission = submissions[submissionCount];

        submission.ngoWallet = msg.sender;  // store NGO wallet
        submission.title = _title;
        submission.description = _description;
        submission.ecosystem = _ecosystem;
        submission.location = _location;
        submission.areaRestored = _areaRestored;
        submission.carbonStored = _carbonStored;
        submission.treesPlanted = _treesPlanted;
        submission.status = "pending";
        submission.submittedAt = block.timestamp;
        submission.exists = true;

        // Add images
        for(uint i = 0; i < _ipfsHashes.length; i++) {
            submission.images.push(Image({
                ipfsHash: _ipfsHashes[i],
                latitude: _latitudes[i],
                longitude: _longitudes[i],
                timestamp: _timestamps[i]
            }));
        }

        // Track submissions per NGO
        ngoSubmissions[msg.sender].push(submissionCount);

        emit SubmissionCreated(submissionCount, msg.sender);
    }

    // ------------------------------------
    // ADMIN FUNCTIONS
    // ------------------------------------

    /// @notice Approve a submission and issue carbon credits
    function approveSubmission(uint256 _submissionId, uint256 _credits) public onlyAdmin {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(keccak256(bytes(submissions[_submissionId].status)) != keccak256("approved"), "Already approved");

        submissions[_submissionId].status = "approved";
        address ngoWallet = _getSubmissionWallet(_submissionId);
        carbonCredits[ngoWallet] += _credits;

        emit SubmissionApproved(_submissionId, ngoWallet, _credits);
    }

    /// @notice Reject a fraudulent or duplicate submission
    function rejectSubmission(uint256 _submissionId) public onlyAdmin {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(keccak256(bytes(submissions[_submissionId].status)) != keccak256("approved"), "Already approved");

        submissions[_submissionId].status = "rejected";

        emit SubmissionRejected(_submissionId, _getSubmissionWallet(_submissionId));
    }

    // ------------------------------------
    // PUBLIC VIEW FUNCTIONS
    // ------------------------------------

    /// @notice Get total carbon credits of a NGO wallet
    function getCarbonCredits(address _ngoWallet) public view returns(uint256) {
        return carbonCredits[_ngoWallet];
    }

    /// @notice Get submission IDs of a specific NGO
    function getNgoSubmissions(address _ngoWallet) public view returns(uint256[] memory) {
        return ngoSubmissions[_ngoWallet];
    }

    /// @notice Get number of images for a submission
    function getImagesCount(uint256 _submissionId) public view returns(uint256) {
        return submissions[_submissionId].images.length;
    }

    /// @notice Get IPFS hash of an image for a submission
    function getImage(uint256 _submissionId, uint256 _index) public view returns(string memory, string memory, string memory, uint256) {
        Image storage img = submissions[_submissionId].images[_index];
        return (img.ipfsHash, img.latitude, img.longitude, img.timestamp);
    }

    // ------------------------------------
    // INTERNAL FUNCTIONS
    // ------------------------------------
    function _getSubmissionWallet(uint256 _submissionId) internal view returns(address) {
        return submissions[_submissionId].ngoWallet;
    }
}
