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


module.exports = { vbuCollege, KolhanUniv, JRSU, JWU, DSMPU, BBMKU, NPU, RU, SKMU };
