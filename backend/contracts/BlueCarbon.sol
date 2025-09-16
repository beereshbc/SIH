// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/// @title BlueCarbon - NGO Project + Carbon Credits System
/// @notice Handles NGO submissions, image approvals/rejections, credits, and multi-admin management
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
        string ngoEmail;
        string title;
        string description;
        string ecosystem;
        string location;
        uint256 areaRestored;
        uint256 carbonStored;
        uint256 treesPlanted;
        Image[] images;
        string status;     // pending | approved | rejected
        uint256 submittedAt;
        bool exists;
    }

    // ------------------------------------
    // STATE
    // ------------------------------------
    mapping(address => bool) public isAdmin; // Multi-admin support
    uint256 public submissionCount;

    mapping(uint256 => PlantingSubmission) public submissions;
    mapping(address => uint256[]) public ngoSubmissions;
    mapping(address => uint256) public carbonCredits;

    mapping(bytes32 => bool) public approvedImageKey;
    mapping(string => bool) public approvedIpfsHash;

    // ------------------------------------
    // EVENTS
    // ------------------------------------
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
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
        require(isAdmin[msg.sender], "Only admin can call this");
        _;
    }

    modifier submissionExists(uint256 _submissionId) {
        require(submissions[_submissionId].exists, "Submission does not exist");
        _;
    }

    // ------------------------------------
    // CONSTRUCTOR
    // ------------------------------------
    constructor() {
        isAdmin[msg.sender] = true; // deployer becomes first admin
        emit AdminAdded(msg.sender);
    }

    // ------------------------------------
    // ADMIN FUNCTIONS
    // ------------------------------------
    function addAdmin(address _newAdmin) external onlyAdmin {
        isAdmin[_newAdmin] = true;
        emit AdminAdded(_newAdmin);
    }

    function removeAdmin(address _admin) external onlyAdmin {
        isAdmin[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function approveImage(uint256 _submissionId, uint256 _imageIndex, uint256 _credits)
        external onlyAdmin submissionExists(_submissionId)
    {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(_imageIndex < submission.images.length, "Image index OOB");

        Image storage img = submission.images[_imageIndex];
        require(keccak256(bytes(img.status)) != keccak256(bytes("verified")), "Image already verified");

        bytes32 key = keccak256(abi.encodePacked(img.ipfsHash));
        require(!approvedImageKey[key], "Duplicate image (ipfs)");
        require(!approvedIpfsHash[img.ipfsHash], "Duplicate ipfsHash");

        img.status = "verified";
        img.credits = _credits;
        img.approvedBy = msg.sender;
        img.approvedAt = block.timestamp;

        approvedImageKey[key] = true;
        approvedIpfsHash[img.ipfsHash] = true;

        carbonCredits[submission.ngoWallet] += _credits;

        emit ImageApproved(
            _submissionId,
            _imageIndex,
            submission.ngoWallet,
            img.ipfsHash,
            img.latitude,
            img.longitude,
            _credits,
            msg.sender,
            block.timestamp
        );
    }

    function rejectImage(uint256 _submissionId, uint256 _imageIndex, string memory _reason)
        external onlyAdmin submissionExists(_submissionId)
    {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(_imageIndex < submission.images.length, "Image index OOB");

        Image storage img = submission.images[_imageIndex];
        require(keccak256(bytes(img.status)) != keccak256(bytes("verified")), "Image already verified");

        img.status = "rejected";
        img.reason = _reason;
        img.approvedBy = msg.sender;
        img.approvedAt = block.timestamp;

        emit ImageRejected(
            _submissionId,
            _imageIndex,
            submission.ngoWallet,
            img.ipfsHash,
            _reason,
            msg.sender,
            block.timestamp
        );
    }

    function approveSubmission(uint256 _submissionId) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(keccak256(bytes(submission.status)) != keccak256(bytes("approved")), "Already approved");

        uint256 totalCredits = 0;
        for (uint i = 0; i < submission.images.length; i++) {
            if (keccak256(bytes(submission.images[i].status)) == keccak256(bytes("verified"))) {
                totalCredits += submission.images[i].credits;
            }
        }

        submission.status = "approved";
        carbonCredits[submission.ngoWallet] += totalCredits;

        emit SubmissionApproved(_submissionId, submission.ngoWallet, totalCredits);
    }

    function rejectSubmission(uint256 _submissionId) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(keccak256(bytes(submission.status)) != keccak256(bytes("approved")), "Already approved");

        submission.status = "rejected";

        emit SubmissionRejected(_submissionId, submission.ngoWallet);
    }

    // ------------------------------------
    // USER FUNCTIONS
    // ------------------------------------
    function submitProject(
        string memory ngoName,
        string memory ngoEmail,
        string memory title,
        string[] memory ipfsHashes,
        string[] memory latitudes,
        string[] memory longitudes
    ) external {
        require(
            ipfsHashes.length == latitudes.length &&
            latitudes.length == longitudes.length,
            "Array length mismatch"
        );

        submissionCount++;
        PlantingSubmission storage submission = submissions[submissionCount];

        submission.ngoWallet = msg.sender;
        submission.ngoName = ngoName;
        submission.ngoEmail = ngoEmail;
        submission.title = title;
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

    function submitPlanting(
        string memory ngoName,
        string memory ngoEmail,
        string memory title,
        string memory description,
        string memory ecosystem,
        string memory location,
        uint256 areaRestored,
        uint256 carbonStored,
        uint256 treesPlanted,
        string[] memory ipfsHashes,
        string[] memory latitudes,
        string[] memory longitudes,
        uint256[] memory timestamps
    ) external {
        require(
            ipfsHashes.length == latitudes.length &&
            latitudes.length == longitudes.length &&
            longitudes.length == timestamps.length,
            "Array length mismatch"
        );

        submissionCount++;
        PlantingSubmission storage submission = submissions[submissionCount];

        submission.ngoWallet = msg.sender;
        submission.ngoName = ngoName;
        submission.ngoEmail = ngoEmail;
        submission.title = title;
        submission.description = description;
        submission.ecosystem = ecosystem;
        submission.location = location;
        submission.areaRestored = areaRestored;
        submission.carbonStored = carbonStored;
        submission.treesPlanted = treesPlanted;
        submission.status = "pending";
        submission.submittedAt = block.timestamp;
        submission.exists = true;

        for (uint i = 0; i < ipfsHashes.length; i++) {
            submission.images.push(Image({
                ipfsHash: ipfsHashes[i],
                latitude: latitudes[i],
                longitude: longitudes[i],
                timestamp: timestamps[i],
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
    // VIEW FUNCTIONS
    // ------------------------------------
    function getImage(uint256 submissionId, uint256 index) external view returns (
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
        Image storage img = submissions[submissionId].images[index];
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

    function getImagesCount(uint256 submissionId) external view returns(uint256) {
        return submissions[submissionId].images.length;
    }

    function getCarbonCredits(address ngoWallet) external view returns(uint256) {
        return carbonCredits[ngoWallet];
    }

    function getNgoSubmissions(address ngoWallet) external view returns(uint256[] memory) {
        return ngoSubmissions[ngoWallet];
    }
}
