class Error
{
	// return media error 
	media ( error_code, netowrk_state )
	{
		let error = '';

		switch( error_code )
		{
			case 1:
				error = 'Fetching process interupted by user.';
			case 2: 
			case 4:
				switch ( netowrk_state )
				{
					case 0:
						error = 'Audio file has not yet been initialized.';
					case 1:
						error = 'Audio is active and has selected a resource, but is not using the network.';
					case 2:
						error = 'Browser is downloading data.';
					case 3:
						error = 'No valid audio source found.';
				}
			break;
			case 3:
				error = 'Error occurred when decoding.';
		}

		return error + ' ERROR_CODE: ' + error_code + ' NETWORK_STATE: ' + netowrk_state;
	}
}

export default new Error();