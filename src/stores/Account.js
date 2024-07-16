import { defineStore } from 'pinia';

export const useInfoAccountStore  = defineStore ('accountStore' , {
    state: () => ({
        genderOptions : {
            M: "Male",
            F: "Female",
            O: "Other",
        },
        roleOptions : {
            R1: "Admin",
            R2: "Owner Court",
            R3: "User",
        },
        valueRoleAdmin: "R1",
        valueRoleOwner: "R2",
    }),
});

export default useInfoAccountStore;