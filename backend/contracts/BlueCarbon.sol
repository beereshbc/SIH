// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/// @title BlueCarbon - NGO Project + Carbon Credits + ERC20 Token Rewards
/// @notice Handles NGO submissions, image/video approvals/rejections, credits, and multi-admin management
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BlueCarbon {

    // ------------------------------------
    // STRUCTS
    // ------------------------------------
    struct Image {
        string ipfsHash;
        string latitude;
        string longitude;
        uint256 timestamp;
        string status;
        string reason;
        uint256 credits;
        address approvedBy;
        uint256 approvedAt;
    }

    struct Video {
        string ipfsHash;
        string latitude;
        string longitude;
        uint256 timestamp;
        string status;
        string reason;
        uint256 credits;
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
        string status;
        uint256 submittedAt;
        bool exists;
    }

    // ------------------------------------
    // STATE VARIABLES
    // ------------------------------------
    IERC20 public token;                     
    uint256 public tokenPerCredit = 100 * 10**18;
    mapping(address => bool) public isAdmin;
    uint256 public submissionCount;
    mapping(uint256 => PlantingSubmission) public submissions;
    mapping(address => uint256[]) public ngoSubmissions;
    mapping(address => uint256) public carbonCredits;

    mapping(bytes32 => bool) public approvedImageKey;
    mapping(bytes32 => bool) public approvedVideoKey;
    mapping(string => bool) public approvedIpfsHash;
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
        uint256 tokenAmount,
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
        uint256 tokenAmount,
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
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        isAdmin[msg.sender] = true;
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

    // ------------------------------------
    // IMAGE APPROVAL
    // ------------------------------------
    function approveImage(
        uint256 _submissionId,
        uint256 _imageIndex,
        uint256 _credits
    ) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        require(_imageIndex < submission.images.length, "Image index OOB");

        Image storage img = submission.images[_imageIndex];
        require(keccak256(bytes(img.status)) != keccak256(bytes("verified")), "Image already verified");

        bytes32 key = keccak256(abi.encodePacked(img.ipfsHash));
        require(!approvedImageKey[key], "Duplicate image");
        require(!approvedIpfsHash[img.ipfsHash], "Duplicate ipfsHash");

        img.status = "verified";
        img.credits = _credits;
        img.approvedBy = msg.sender;
        img.approvedAt = block.timestamp;

        approvedImageKey[key] = true;
        approvedIpfsHash[img.ipfsHash] = true;

        carbonCredits[submission.ngoWallet] += _credits;
        uint256 tokenAmount = _credits * tokenPerCredit;
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");
        token.transfer(submission.ngoWallet, tokenAmount);

        emit ImageApproved(
            _submissionId,
            _imageIndex,
            submission.ngoWallet,
            img.ipfsHash,
            img.latitude,
            img.longitude,
            _credits,
            tokenAmount,
            msg.sender,
            block.timestamp
        );
    }

    function rejectImage(
        uint256 _submissionId,
        uint256 _imageIndex,
        string memory _reason
    ) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        Image storage img = submission.images[_imageIndex];
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

    // ------------------------------------
    // VIDEO APPROVAL
    // ------------------------------------
    function approveVideo(
        uint256 _submissionId,
        uint256 _videoIndex,
        uint256 _credits
    ) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        Video storage vid = submission.videos[_videoIndex];
        require(keccak256(bytes(vid.status)) != keccak256(bytes("verified")), "Video already verified");

        bytes32 key = keccak256(abi.encodePacked(vid.ipfsHash));
        require(!approvedVideoKey[key], "Duplicate video");
        require(!approvedVideoIpfs[vid.ipfsHash], "Duplicate ipfsHash");

        vid.status = "verified";
        vid.credits = _credits;
        vid.approvedBy = msg.sender;
        vid.approvedAt = block.timestamp;

        approvedVideoKey[key] = true;
        approvedVideoIpfs[vid.ipfsHash] = true;

        carbonCredits[submission.ngoWallet] += _credits;
        uint256 tokenAmount = _credits * tokenPerCredit;
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");
        token.transfer(submission.ngoWallet, tokenAmount);

        emit VideoApproved(
            _submissionId,
            _videoIndex,
            submission.ngoWallet,
            vid.ipfsHash,
            vid.latitude,
            vid.longitude,
            _credits,
            tokenAmount,
            msg.sender,
            block.timestamp
        );
    }

    function rejectVideo(
        uint256 _submissionId,
        uint256 _videoIndex,
        string memory _reason
    ) external onlyAdmin submissionExists(_submissionId) {
        PlantingSubmission storage submission = submissions[_submissionId];
        Video storage vid = submission.videos[_videoIndex];
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

    // ------------------------------------
    // SUBMISSION (PROJECT) - ONLY ONCHAIN
    // ------------------------------------
    function submitProject(
        string memory ngoName,
        string memory ngoEmail,
        string memory title,
        string[] memory ipfsHashes,
        string[] memory latitudes,
        string[] memory longitudes
    ) external {
        require(ipfsHashes.length == latitudes.length && latitudes.length == longitudes.length, "Array length mismatch");

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
            submission.images.push(Image(ipfsHashes[i], latitudes[i], longitudes[i], block.timestamp, "pending", "", 0, address(0), 0));
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
        require(imageHashes.length == imageLatitudes.length && imageLatitudes.length == imageLongitudes.length && imageLongitudes.length == imageTimestamps.length, "Image array mismatch");
        require(videoHashes.length == videoLatitudes.length && videoLatitudes.length == videoLongitudes.length && videoLongitudes.length == videoTimestamps.length, "Video array mismatch");

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
            submission.images.push(Image(imageHashes[i], imageLatitudes[i], imageLongitudes[i], imageTimestamps[i], "pending", "", 0, address(0), 0));
        }
        for (uint j = 0; j < videoHashes.length; j++) {
            submission.videos.push(Video(videoHashes[j], videoLatitudes[j], videoLongitudes[j], videoTimestamps[j], "pending", "", 0, address(0), 0));
        }

        ngoSubmissions[msg.sender].push(submissionCount);
        emit SubmissionCreated(submissionCount, msg.sender);
    }

    // ------------------------------------
    // VIEW FUNCTIONS
    // ------------------------------------
    function getImage(uint256 submissionId, uint256 index) external view returns (Image memory) {
        return submissions[submissionId].images[index];
    }

    function getVideo(uint256 submissionId, uint256 index) external view returns (Video memory) {
        return submissions[submissionId].videos[index];
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
