Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

class B787_10_FMC_HeavyConfigurationPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();

		let fpSyncCell = (this.isFPSyncActive() ? '<[color=green]ON[/color]←→[size=small]OFF[/size]' : '<[size=small]ON[/size]←→[color=red]OFF[/color]')
		let simBriefCell = (this.isSimBriefFilled() ? '<[color=green]FILLED[/color]' : '<[color=red]NOT FILLED[/color]')
		fmc.setTemplate([
			['HEAVY CONFIGURATION'],
			['', 'SimBrief'],
			['', simBriefCell],
			[''],
			[''],
			['', 'FP SYNC'],
			['', fpSyncCell],
			[''],
			[''],
			[''],
			[''],
			[''],
			['<BACK']
		]);

		this.setupInputHandlers(fmc);

		fmc.updateSideButtonActiveStatus();
	}

	static setupInputHandlers(fmc){
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		}

		fmc.onRightInput[0] = () => {
			new B787_10_FMC_SimBriefConfigurationPage(fmc).showPage();
		}

		fmc.onRightInput[2] = () => {
			if(this.isFPSyncActive()){
				WTDataStore.set('WT_CJ4_FPSYNC', 0)
			} else {
				WTDataStore.set('WT_CJ4_FPSYNC', 1)
			}
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		}
	}

	static isSimBriefFilled(){
		let username = HeavyDataStorage.get('SIMBRIEF_USERNAME', '');
		let userid = HeavyDataStorage.get('SIMBRIEF_USERID', '');

		return (username !== '' || userid !== '');
	}

	static isFPSyncActive(){
		return (!!WTDataStore.get('WT_CJ4_FPSYNC', 0));
	}
}