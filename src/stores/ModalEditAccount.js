import { defineStore } from 'pinia';

export const useInfoModal = defineStore('infoModal', {
    state: () => ({
        showModal: false,
        account: {},
        showPassword: false,
        showModalItsMe: false,
    })
});

export default useInfoModal;