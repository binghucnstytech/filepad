import { SAVE_BLOCK, REMOVE_BLOCK } from '../constants/ActionTypes.js'

const initialState = [{
    text: 'Use Redux',
    marked: false,
    id: 0
}];

export default function filePad(state = 0, action = {}) {
    switch (action.type) {
        case SAVE_BLOCK:
            return state;

        case REMOVE_BLOCK:
            return state;

    }
}