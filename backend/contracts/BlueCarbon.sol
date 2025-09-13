// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/// @title BlueCarbon - NGO Project + Carbon Credits System
/// @notice Handles NGO submissions, image-level approvals, and carbon credits
contract BlueCarbon {
    // ------------------------------------
    // STRUCTS
    // ------------------------------------
    struct Image {
        string ipfsHash;
        string latitude;
        string longitude;
        uint256 timestamp;
        string status;    // pending | verified | rejected
        string reason;    // rejection reason
        uint256 credits;  // credits assigned if verified
        address approvedBy;
        uint256 approvedAt;
    }

    struct PlantingSubmission {
        address ngoWallet;
        string ngoName;
        string ngoEmail;       // ✅ added email field (useful for off-chain + audit)
        string title;
        string description;
        string ecosystem;
        string location;
        uint256 areaRestored;
        uint256 carbonStored;
        uint256 treesPlanted;
        Image[] images;
        string status;         // pending | approved | rejected
        uint256 submittedAt;
        bool exists;
    }

    // ------------------------------------
    // STATE VARIABLES
    // ------------------------------------
    address public admin;
    uint256 public submissionCount;

    mapping(uint256 => PlantingSubmission) public submissions;
    mapping(address => uint256[]) public ngoSubmissions;
    mapping(address => uint256) public carbonCredits;

    mapping(bytes32 => bool) public approvedImageKey;
    mapping(string => bool) public approvedIpfsHash;

    // ------------------------------------
    // EVENTS
    // ------------------------------------
    event SubmissionCreated(uint256 indexed submissionId, address indexed ngoWallet);
    event ProjectSubmitted(uint256 submissionId, string ngoEmail);
    event ImageApproved(
        uint256 indexed submissionId,
        uint256 indexed imageIndex,
        address indexed ngoWallet,
        string ipfsHash,
        string latitude,
        string longitude,
        uint256 credits,
        address admin,
        uint256 timestamp
    );
    event ImageRejected(
        uint256 indexed submissionId,
        uint256 indexed imageIndex,
        address indexed ngoWallet,
        string ipfsHash,
        string reason,
        address admin,
        uint256 timestamp
    );
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

    /// @notice Minimal project submit (for NGO off-chain + on-chain mapping)
    function submitProject(
        string memory ngoName,
        string memory ngoEmail,
        string memory title,
        string[] memory ipfsHashes,
        string[] memory latitudes,
        string[] memory longitudes
    ) public {
        require(
            ipfsHashes.length == latitudes.length &&
            latitudes.length == longitudes.length,
            "Array length mismatch"
        );

        submissionCount++;
        PlantingSubmission storage submission = submissions[submissionCount];

        submission.ngoWallet = msg.sender;
        submission.ngoName = ngoName;
        submission.ngoEmail = ngoEmail; // ✅ stored email
        submission.title = title;
        submission.description = "";
        submission.ecosystem = "";
        submission.location = "";
        submission.areaRestored = 0;
        submission.carbonStored = 0;
        submission.treesPlanted = 0;
        submission.status = "pending";
        submission.submittedAt = block.timestamp;
        submission.exists = true;

        for (uint i = 0; i < ipfsHashes.length; i++) {
            submission.images.push(Image({
                ipfsHash: ipfsHashes[i],
                latitude: latitudes[i],
                longitude: longitudes[i],
                timestamp: block.timestamp,
                status: "pending",
                reason: "",
                credits: 0,
                approvedBy: address(0),
                approvedAt: 0
            }));
        }

        ngoSubmissions[msg.sender].push(submissionCount);

        emit ProjectSubmitted(submissionCount, ngoEmail);
    }

    /// @notice Full-featured project submission
    function submitPlanting(
        string memory _ngoName,
        string memory _ngoEmail,
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

        submission.ngoWallet = msg.sender;
        submission.ngoName = _ngoName;
        submission.ngoEmail = _ngoEmail;
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

        for (uint i = 0; i < _ipfsHashes.length; i++) {
            submission.images.push(Image({
                ipfsHash: _ipfsHashes[i],
                latitude: _latitudes[i],
                longitude: _longitudes[i],
                timestamp: _timestamps[i],
                status: "pending",
                reason: "",
                credits: 0,
                approvedBy: address(0),
                approvedAt: 0
            }));
        }

        ngoSubmissions[msg.sender].push(submissionCount);

        emit SubmissionCreated(submissionCount, msg.sender);
    }

    // ------------------------------------
    // ADMIN FUNCTIONS
    // ------------------------------------

    function approveImage(uint256 _submissionId, uint256 _imageIndex, uint256 _credits) public onlyAdmin {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(_imageIndex < submissions[_submissionId].images.length, "Image index OOB");

        Image storage img = submissions[_submissionId].images[_imageIndex];
        require(keccak256(bytes(img.status)) != keccak256(bytes("verified")), "Image already verified");

        bytes32 key = keccak256(abi.encodePacked(img.ipfsHash));
        // bytes32 key = keccak256(abi.encodePacked(img.ipfsHash, "|", img.latitude, "|", img.longitude));
        require(!approvedImageKey[key], "Duplicate image (ipfs+gps)");
        if (approvedIpfsHash[img.ipfsHash]) revert("Duplicate ipfsHash already approved");

        img.status = "verified";
        img.credits = _credits;
        img.approvedBy = msg.sender;
        img.approvedAt = block.timestamp;

        approvedImageKey[key] = true;
        approvedIpfsHash[img.ipfsHash] = true;

        address ngoWallet = submissions[_submissionId].ngoWallet;
        carbonCredits[ngoWallet] += _credits;

        emit ImageApproved(
            _submissionId,
            _imageIndex,
            ngoWallet,
            img.ipfsHash,
            img.latitude,
            img.longitude,
            _credits,
            msg.sender,
            block.timestamp
        );
    }

    function rejectImage(uint256 _submissionId, uint256 _imageIndex, string memory _reason) public onlyAdmin {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(_imageIndex < submissions[_submissionId].images.length, "Image index OOB");

        Image storage img = submissions[_submissionId].images[_imageIndex];
        require(keccak256(bytes(img.status)) != keccak256(bytes("verified")), "Image already verified");

        img.status = "rejected";
        img.reason = _reason;
        img.approvedBy = msg.sender;
        img.approvedAt = block.timestamp;

        emit ImageRejected(
            _submissionId,
            _imageIndex,
            submissions[_submissionId].ngoWallet,
            img.ipfsHash,
            _reason,
            msg.sender,
            block.timestamp
        );
    }

    function approveSubmission(uint256 _submissionId) public onlyAdmin {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(keccak256(bytes(submissions[_submissionId].status)) != keccak256(bytes("approved")), "Already approved");

        uint256 totalCredits = 0;
        for (uint i = 0; i < submissions[_submissionId].images.length; i++) {
            if (keccak256(bytes(submissions[_submissionId].images[i].status)) == keccak256(bytes("verified"))) {
                totalCredits += submissions[_submissionId].images[i].credits;
            }
        }

        submissions[_submissionId].status = "approved";
        address ngoWallet = submissions[_submissionId].ngoWallet;

        emit SubmissionApproved(_submissionId, ngoWallet, totalCredits);
    }

    function rejectSubmission(uint256 _submissionId) public onlyAdmin {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(keccak256(bytes(submissions[_submissionId].status)) != keccak256(bytes("approved")), "Already approved");

        submissions[_submissionId].status = "rejected";

        emit SubmissionRejected(_submissionId, submissions[_submissionId].ngoWallet);
    }

    // ------------------------------------
    // VIEW FUNCTIONS
    // ------------------------------------
    function getImage(uint256 _submissionId, uint256 _index) public view returns (
        string memory ipfsHash,
        string memory latitude,
        string memory longitude,
        uint256 timestamp,
        string memory status,
        string memory reason,
        uint256 credits,
        address approvedBy,
        uint256 approvedAt
    ) {
        Image storage img = submissions[_submissionId].images[_index];
        return (
            img.ipfsHash,
            img.latitude,
            img.longitude,
            img.timestamp,
            img.status,
            img.reason,
            img.credits,
            img.approvedBy,
            img.approvedAt
        );
    }

    function getImagesCount(uint256 _submissionId) public view returns(uint256) {
        return submissions[_submissionId].images.length;
    }

    function getCarbonCredits(address _ngoWallet) public view returns(uint256) {
        return carbonCredits[_ngoWallet];
    }

    function getNgoSubmissions(address _ngoWallet) public view returns(uint256[] memory) {
        return ngoSubmissions[_ngoWallet];
    }
}
