import { SAVE_BLOCK, REMOVE_BLOCK, EDIT_BLOCK } from '../constants/ActionTypes.js';

export function editBlock(id,data) {
    return {
        type: EDIT_BLOCK,
        id,
        data
    }
}

export function addBlock(type,data) {
    return {
        type: ADD_BLOCK,
        id,
        data
    }
}