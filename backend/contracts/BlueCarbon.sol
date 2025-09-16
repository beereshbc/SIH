// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/// @title BlueCarbon - NGO Project + Carbon Credits System
/// @notice Handles NGO submissions, image + video approvals/rejections, credits, and multi-admin management
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

    struct Video {
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
        Video[] videos;
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

    mapping(bytes32 => bool) public approvedVideoKey;
    mapping(string => bool) public approvedVideoIpfs;

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

    event VideoApproved(
        uint256 indexed submissionId,
        uint256 indexed videoIndex,
        address indexed ngoWallet,
        string ipfsHash,
        string latitude,
        string longitude,
        uint256 credits,
        address admin,
        uint256 timestamp
    );
    event VideoRejected(
        uint256 indexed submissionId,
        uint256 indexed videoIndex,
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

    // ---- IMAGE APPROVAL ----
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

    // ---- VIDEO APPROVAL ----
    function approveVideo(uint256 _submissionId, uint256 _videoIndex, uint256 _credits)
        external onlyAdmin submissionExists(_submissionId)
    {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(_videoIndex < submission.videos.length, "Video index OOB");

        Video storage vid = submission.videos[_videoIndex];
        require(keccak256(bytes(vid.status)) != keccak256(bytes("verified")), "Video already verified");

        bytes32 key = keccak256(abi.encodePacked(vid.ipfsHash));
        require(!approvedVideoKey[key], "Duplicate video (ipfs)");
        require(!approvedVideoIpfs[vid.ipfsHash], "Duplicate ipfsHash");

        vid.status = "verified";
        vid.credits = _credits;
        vid.approvedBy = msg.sender;
        vid.approvedAt = block.timestamp;

        approvedVideoKey[key] = true;
        approvedVideoIpfs[vid.ipfsHash] = true;

        carbonCredits[submission.ngoWallet] += _credits;

        emit VideoApproved(
            _submissionId,
            _videoIndex,
            submission.ngoWallet,
            vid.ipfsHash,
            vid.latitude,
            vid.longitude,
            _credits,
            msg.sender,
            block.timestamp
        );
    }

    function rejectVideo(uint256 _submissionId, uint256 _videoIndex, string memory _reason)
        external onlyAdmin submissionExists(_submissionId)
    {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(_videoIndex < submission.videos.length, "Video index OOB");

        Video storage vid = submission.videos[_videoIndex];
        require(keccak256(bytes(vid.status)) != keccak256(bytes("verified")), "Video already verified");

        vid.status = "rejected";
        vid.reason = _reason;
        vid.approvedBy = msg.sender;
        vid.approvedAt = block.timestamp;

        emit VideoRejected(
            _submissionId,
            _videoIndex,
            submission.ngoWallet,
            vid.ipfsHash,
            _reason,
            msg.sender,
            block.timestamp
        );
    }

    // ---- SUBMISSION STATUS ----
    function approveSubmission(uint256 _submissionId) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(keccak256(bytes(submission.status)) != keccak256(bytes("approved")), "Already approved");

        uint256 totalCredits = 0;
        for (uint i = 0; i < submission.images.length; i++) {
            if (keccak256(bytes(submission.images[i].status)) == keccak256(bytes("verified"))) {
                totalCredits += submission.images[i].credits;
            }
        }
        for (uint j = 0; j < submission.videos.length; j++) {
            if (keccak256(bytes(submission.videos[j].status)) == keccak256(bytes("verified"))) {
                totalCredits += submission.videos[j].credits;
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
        string[] memory imageHashes,
        string[] memory imageLatitudes,
        string[] memory imageLongitudes,
        uint256[] memory imageTimestamps,
        string[] memory videoHashes,
        string[] memory videoLatitudes,
        string[] memory videoLongitudes,
        uint256[] memory videoTimestamps
    ) external {
        require(
            imageHashes.length == imageLatitudes.length &&
            imageLatitudes.length == imageLongitudes.length &&
            imageLongitudes.length == imageTimestamps.length,
            "Image array length mismatch"
        );
        require(
            videoHashes.length == videoLatitudes.length &&
            videoLatitudes.length == videoLongitudes.length &&
            videoLongitudes.length == videoTimestamps.length,
            "Video array length mismatch"
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

        for (uint i = 0; i < imageHashes.length; i++) {
            submission.images.push(Image({
                ipfsHash: imageHashes[i],
                latitude: imageLatitudes[i],
                longitude: imageLongitudes[i],
                timestamp: imageTimestamps[i],
                status: "pending",
                reason: "",
                credits: 0,
                approvedBy: address(0),
                approvedAt: 0
            }));
        }

        for (uint j = 0; j < videoHashes.length; j++) {
            submission.videos.push(Video({
                ipfsHash: videoHashes[j],
                latitude: videoLatitudes[j],
                longitude: videoLongitudes[j],
                timestamp: videoTimestamps[j],
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

    function getVideo(uint256 submissionId, uint256 index) external view returns (
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
        Video storage vid = submissions[submissionId].videos[index];
        return (
            vid.ipfsHash,
            vid.latitude,
            vid.longitude,
            vid.timestamp,
            vid.status,
            vid.reason,
            vid.credits,
            vid.approvedBy,
            vid.approvedAt
        );
    }

    function getImagesCount(uint256 submissionId) external view returns(uint256) {
        return submissions[submissionId].images.length;
    }

    function getVideosCount(uint256 submissionId) external view returns(uint256) {
        return submissions[submissionId].videos.length;
    }

    function getCarbonCredits(address ngoWallet) external view returns(uint256) {
        return carbonCredits[ngoWallet];
    }

    function getNgoSubmissions(address ngoWallet) external view returns(uint256[] memory) {
        return ngoSubmissions[ngoWallet];
    }
}
