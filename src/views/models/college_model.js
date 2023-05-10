const mongoose = require('mongoose');

//  university list schema start
const collegeListSchema = mongoose.Schema({
    _id: {
        type: Number,
    },
    Coll_Code: {
        type: String,
        unique: true,
        required: [true, "College Code is missing"]
    },
    Coll_Name: {
        type: String,
        unique: true,
        required: [true, "College Name is missing"]
    },
    Dist_Name: {
        type: String,
        required: [true, "District Name is missing"]
    },
    Type: {
        type: String,
        required: [true, "Type is missing"]
    },
    Princ_Name: String,
    university: {
        type: String
    }
});

const vbuCollege = mongoose.model("vbulist", collegeListSchema);
const KolhanUniv = mongoose.model("Kolhan_university", collegeListSchema);
const JRSU = mongoose.model("Jrsu", collegeListSchema);
const JWU = mongoose.model("JWUniversity", collegeListSchema);
const DSMPU = mongoose.model("Dspmu", collegeListSchema);
const BBMKU = mongoose.model("Bbmku", collegeListSchema);
const NPU = mongoose.model("Npu", collegeListSchema);
const RU = mongoose.model("Runiversity", collegeListSchema);
const SKMU = mongoose.model("SKMuniversity", collegeListSchema);

//  university list schema end

//  college Application Schema start
const applicationSchema = mongoose.Schema({
    course: String,
    fName: {
        type: String,
        required: [true, "First name is missing"]
    },
    mName: {
        type: String,
    },
    lName: {
        type: String,
        required: [true, "Last name is missing"]
    },
    fatherName: {
        type: String,
        required: [true, "Father name is missing"]
    },
    motherName: {
        type: String,
        required: [true, "Mother name is missing"]
    },
    mobileNo: Number,
    emailId: String,
    gender: {
        type: String,
        required: [true, "Gender is missing"]
    },
    cast: {
        type: String,
        required: [true, "Cast is missing"]
    },
    dateOfBirth: {
        type: Date,
        required: [true, "Date Of Birth is missing"]
    },
    addressLine1: {
        type: String,
        required: [true, "Address Line1 is missing"]
    },
    addressLine2: {
        type: String,
        required: [true, "Address Line2 is missing"]
    },
    block: {
        type: String,
        required: [true, "Block is missing"]
    },
    district: {
        type: String,
        required: [true, "District is missing"]
    },
    pincode: {
        type: Number,
        required: [true, "Pincode is missing"]
    },
    lastPassedExam: {
        type: String,
        required: [true, "Last Passed Exam is missing"]
    },
    universityNameLastPassed: {
        type: String,
        required: [true, "University name is missing"]
    },
    session: {
        type: String,
        required: [true, "Session is missing"]
    },
    registrationNo: {
        type: String,
        required: [true, "Registration number is missing"]
    },
    passingYear: {
        type: String,
        required: [true, "Please enter passing year"]
    },
    courseTypeStudied: {
        type: String,
        required: [true, "Course Type is missing"]
    },
    subjectStudied: {
        type: String,
        required: [true, "Please enter subject studied"]
    },
    cgpa: {
        type: String,
        required: [true, "CGPA is missing"]
    },
    percentageOfMarks: {
        type: String,
        required: [true, "Please enter percentage of marks"]
    },
    totalCredit: {
        type: String,
        required: [true, "Please enter total credit"]
    },
    totalSecuredCredit: {
        type: String,
        required: [true, "Please enter total secured credit"]
    },
    university: {
        type: String,
        required: [true, "University name is missing"]
    },
    collegeName: {
        type: String,
        required: [true, "College name is missing"]
    },
    stream: {
        type: String,
        required: [true, "Plese select stream"]
    },
    courseType: {
        type: String,
        required: [true, "Plese select course type"]
    },
    status: String,
    photo: {
        type: String,
        required: [true, "Photo is missing"]
    },
    signatire: {
        type: String,
        required: [true, "Signature name is missing"]
    }
})
//  college Application Schema end

const application = mongoose.model("stuApplication", applicationSchema);

module.exports = { vbuCollege, KolhanUniv, JRSU, JWU, DSMPU, BBMKU, NPU, RU, SKMU, application };
