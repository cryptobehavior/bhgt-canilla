import { takeEvery, put, all, call } from 'redux-saga/effects'
import { eth } from 'decentraland-eth'
import { env } from 'decentraland-commons'
import { createWalletSaga } from '@dapps/modules/wallet/sagas'
import {
  REFILL_MANA_REQUEST,
  RefillManaRequestAction,
  refillManaSuccess,
  refillManaFailure
} from 'modules/wallet/actions'
import { manaToken } from 'contracts'

const baseWalletSaga = createWalletSaga({
  provider: env.get('REACT_APP_PROVIDER_URL'),
  contracts: [manaToken],
  eth
})

export function* walletSaga() {
  yield all([baseWalletSaga(), walletBalanceSaga()])
}

function* walletBalanceSaga() {
  yield takeEvery(REFILL_MANA_REQUEST, handleRefillManaRequest)
}

function* handleRefillManaRequest(action: RefillManaRequestAction) {
  try {
    const { address, mana } = action.payload

    const txHash: string = yield call(() =>
      manaToken.setBalance(address, mana) // ropsten only
    )

    yield put(refillManaSuccess(txHash, address, mana))
  } catch (error) {
    yield put(refillManaFailure(error.message))
  }
}
