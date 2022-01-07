Math.max(0, Math.min(255, 128 + 100 * ((Math.round(
	Math.max(-1,Math.min(1,Math.sin(
		t * 0.07444 / ((Math.round(t/48000+3+4)%48>39?1:2)*(Math.round(t/48000+3+4)%64>47?1:0.5)) * Math.pow(2,(int(Math.max(0,Math.min(7,Math.round(Math.abs((int(8 + t/12000) % 16) - 8)) * 2 - 4 - (int(t/12000)%16>=5&&int(t/12000)%16<12))))-7) / 12)
	) * 10 + (4.9*Math.sin(t/14051)) * Math.sin(t/39004))) * (100 + 80 * Math.sin(t/20499))
) / (100 + 80 * Math.sin(t/20499)) * (
	int(t/1500-0.5) % 8 > 5 || int(t/12000-2) % 8 > (int(t/48000-1) % 8 < 4 ? (int(t/12000-2) % 8 == 6 ? 6 : 4) : 6) ?
		0.1
		:
		t%12000 > 6000 ?
			0.3
			:
			0.6+0.1*Math.sin(t/4190)
) + (0.25+0.12*Math.cos(t/20000)) * Math.round(
	Math.max(-1,Math.min(1,Math.sin(
		t * 0.0743 / ((Math.round(t/48000+7)%56>47?1:2)*(Math.round(t/48000+7)%80>55?1:0.5)) * Math.pow(2,(Math.max(-1,Math.min(4,(int((int(t/12000+2)%16 < 5) ? 0 :(Math.round(Math.abs((int(8 + t/12000) % 16) - 8)) * 2 - 8)))))-7) / 12)
	) * 10 + (4.9*Math.sin(t/24051)) * Math.sin(t/39504))) * (22 + 11 * Math.sin(t/21499)) * (int(t/6000)%4==1 ? 0.5 : 1)
) / (22 + 11 * Math.sin(t/21499))) * 0.6 + (t<24000?0.1:0.7+0.2*Math.sin(t/12345)) * Math.sin(
	Math.max(-0.3,Math.min(0.3,
		Math.sin
		(
			t * 0.07444 / 4 * Math.pow(2, (
				int(t/24000+1) % 8 < 6 ?
					int(7 + 7 * Math.sin((1547167+(int(t/6000) % 4)) * Math.sin((1547167+(int(t/6000) % 4))/4129)))
					:
					int(5 + 6 * Math.sin((4664+(int(t/6000) % 4)) * Math.sin((4664+(int(t/6000) % 4)))))
			) / 12 + (int(t/6000) % 2))
		) * (8 + 4 * Math.sin(t/25210)) + 3.7 * Math.sin(t/50040)
	)) + 1 * Math.sin(t/4191)
))))