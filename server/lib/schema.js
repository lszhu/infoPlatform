var employer = {
    name: String,
    code: String,
    phone: String,
    contact: String,
    position: String,
    description: String,
    education: String,
    salary: Number,
    date: Date
};
var employee = {
    name: String,
    IdNumber: String,
    phone: String,
    contact: String,
    education: String,
    seniority: String,
    experience: String,
    position: String,
    salary: Number,
    date: Date
};
var orgInfo = {
    name: String,
    districtId: String,
    address: String,
    phone: String,
    contact: String,
    picture: String,
    overview: String,
    introduction: String
};
var policy = {
    title: String,
    publisher: String,
    content: String,
    date: Date
};
var message = {
    title: String,
    publisher: String,
    content: String,
    date: Date
};
var suggestion = {
    name: String,
    idNumber: String,
    phone: String,
    suggestion: String
};
var log = {
    time: Date,
    operator: String,
    operation: String,
    target: String,
    comment: String,
    status: String
};
var account = {
    username: String,
    password: String,
    enabled: Boolean,
    description: String,
    groups: [String],
    rights: String
};
var group = {
    name: String,
    comment: String,
    accounts: [String],
    rights: {
        system: {
            log: Boolean,
            account: Boolean,
            group: Boolean
        },
        projects: Boolean,
        subjects: Boolean,
        date: {
            begin: Boolean,
            end: Boolean
        },
        figures: {
            readable: Boolean,
            removable: Boolean
        },
        voucher: Boolean,
        contract: Boolean,
        archive: {
            figure: Boolean,
            cheque: Boolean,
            contract: Boolean,
            file: Boolean,
            digital: Boolean,
            original: Boolean
        },
        destroy: Boolean,
        approval: Boolean,
        lending: {
            voucher: Boolean,
            contract: Boolean,
            file: Boolean
        }
    }
};
var organization = {
    name: String,
    code: String,
    districtId: String,
    legalPerson: String,
    contact: String,
    phone: String,
    address: String,
    type: String,
    economicType: String,
    jobForm: String,
    industry: String,
    staffs: Number
};
var person = {
    // basic info
    username: String,
    idNumber: String,
    nation: String,
    // readonly basic info
    age: Number,
    birthday: Number,
    gender: String,
    workRegisterId: String,
    address: {
        county: String,
        town: String,
        village: String
    },
    districtId: String,
    // still basic info
    education: String,
    graduateDate: Number,
    phone: String,
    censusRegisterType: String,
    politicalOutlook: String,
    marriage: String,
    // training and service info
    trainingType: String,
    postTraining: String,
    technicalGrade: String,
    postService: [String],
    extraPostService: String,
    // employment/unemployment switch
    employment: String,
    // employment info
    employmentInfo: {
        employer: String,
        jobType: String,
        industry: String,
        startWorkDate: String,
        workplace: String,
        workProvince: String,
        salary: Number,
        jobForm: String
    },
    // unemployment info
    unemploymentInfo: {
        humanCategory: String,
        unemployedDate: String,
        unemploymentCause: String,
        familyType: String,
        preferredJobType: [String],
        //extraPreferredJobType: String,
        preferredSalary: Number,
        preferredIndustry: String,
        preferredWorkplace: String,
        preferredJobForm: String,
        preferredService: [String],
        extraPreferredService: String,
        preferredTraining: String
    },
    // insurance info
    insurance: [String],
    // editor info
    editor: String,
    modifiedDate: Date
};

module.exports = {
    employer: employer,
    employee: employee,
    orgInfo: orgInfo,
    policy: policy,
    message: message,
    log: log,
    account: account,
    group: group,
    organization: organization,
    person: person
};