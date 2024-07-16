import { defineStore } from 'pinia';

export const useInfoModalBadmintonCourt = defineStore('infoModalBadmintonCourt', {
    state: () => ({
        showModalEdit: false,
        showModalCreate: false,
    })
});

export default useInfoModalBadmintonCourt;