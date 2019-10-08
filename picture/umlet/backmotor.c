/*
 * DRV260X haptics driver family
 *
 * Author: Dan Murphy <dmurphy@ti.com>
 *
 * Copyright:   (C) 2014 Texas Instruments, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 */

#include <linux/i2c.h>
#include <linux/input.h>
#include <linux/module.h>
#include <linux/of_gpio.h>
#include <linux/platform_device.h>
#include <linux/regmap.h>
#include <linux/hrtimer.h>
#include <linux/slab.h>
#include <linux/delay.h>
#include <linux/gpio/consumer.h>
#include <linux/regulator/consumer.h>
#include "../staging/android/timed_output.h"
#include <linux/qpnp/pwm.h>


#include <dt-bindings/input/ti-drv260x.h>
#include <linux/platform_data/drv260x-pdata.h>

#define DRV260X_STATUS		0x0
#define DRV260X_MODE		0x1
#define DRV260X_RT_PB_IN	0x2
#define DRV260X_LIB_SEL		0x3
#define DRV260X_WV_SEQ_1	0x4
#define DRV260X_WV_SEQ_2	0x5
#define DRV260X_WV_SEQ_3	0x6
#define DRV260X_WV_SEQ_4	0x7
#define DRV260X_WV_SEQ_5	0x8
#define DRV260X_WV_SEQ_6	0x9
#define DRV260X_WV_SEQ_7	0xa
#define DRV260X_WV_SEQ_8	0xb
#define DRV260X_GO				0xc
#define DRV260X_OVERDRIVE_OFF	0xd
#define DRV260X_SUSTAIN_P_OFF	0xe
#define DRV260X_SUSTAIN_N_OFF	0xf
#define DRV260X_BRAKE_OFF		0x10
#define DRV260X_A_TO_V_CTRL		0x11
#define DRV260X_A_TO_V_MIN_INPUT	0x12
#define DRV260X_A_TO_V_MAX_INPUT	0x13
#define DRV260X_A_TO_V_MIN_OUT	0x14
#define DRV260X_A_TO_V_MAX_OUT	0x15
#define DRV260X_RATED_VOLT		0x16
#define DRV260X_OD_CLAMP_VOLT	0x17
#define DRV260X_CAL_COMP		0x18
#define DRV260X_CAL_BACK_EMF	0x19
#define DRV260X_FEEDBACK_CTRL	0x1a
#define DRV260X_CTRL1			0x1b
#define DRV260X_CTRL2			0x1c
#define DRV260X_CTRL3			0x1d
#define DRV260X_CTRL4			0x1e
#define DRV260X_CTRL5			0x1f
#define DRV260X_LRA_LOOP_PERIOD	0x20
#define DRV260X_VBAT_MON		0x21
#define DRV260X_LRA_RES_PERIOD	0x22
#define DRV260X_MAX_REG			0x23

#define DRV260X_GO_BIT				0x01

/* Library Selection */
#define DRV260X_LIB_SEL_MASK		0x07
#define DRV260X_LIB_SEL_RAM			0x0
#define DRV260X_LIB_SEL_OD			0x1
#define DRV260X_LIB_SEL_40_60		0x2
#define DRV260X_LIB_SEL_60_80		0x3
#define DRV260X_LIB_SEL_100_140		0x4
#define DRV260X_LIB_SEL_140_PLUS	0x5

#define DRV260X_LIB_SEL_HIZ_MASK	0x10
#define DRV260X_LIB_SEL_HIZ_EN		0x01
#define DRV260X_LIB_SEL_HIZ_DIS		0

/* Mode register */
#define DRV260X_STANDBY				(1 << 6)
#define DRV260X_STANDBY_MASK		0x40
#define DRV260X_INTERNAL_TRIGGER	0x00
#define DRV260X_EXT_TRIGGER_EDGE	0x01
#define DRV260X_EXT_TRIGGER_LEVEL	0x02
#define DRV260X_PWM_ANALOG_IN		0x03
#define DRV260X_AUDIOHAPTIC			0x04
#define DRV260X_RT_PLAYBACK			0x05
#define DRV260X_DIAGNOSTICS			0x06
#define DRV260X_AUTO_CAL			0x07

/* Audio to Haptics Control */
#define DRV260X_AUDIO_HAPTICS_PEAK_10MS		(0 << 2)
#define DRV260X_AUDIO_HAPTICS_PEAK_20MS		(1 << 2)
#define DRV260X_AUDIO_HAPTICS_PEAK_30MS		(2 << 2)
#define DRV260X_AUDIO_HAPTICS_PEAK_40MS		(3 << 2)

#define DRV260X_AUDIO_HAPTICS_FILTER_100HZ	0x00
#define DRV260X_AUDIO_HAPTICS_FILTER_125HZ	0x01
#define DRV260X_AUDIO_HAPTICS_FILTER_150HZ	0x02
#define DRV260X_AUDIO_HAPTICS_FILTER_200HZ	0x03

/* Min/Max Input/Output Voltages */
#define DRV260X_AUDIO_HAPTICS_MIN_IN_VOLT	0x19
#define DRV260X_AUDIO_HAPTICS_MAX_IN_VOLT	0xFF
#define DRV260X_AUDIO_HAPTICS_MIN_OUT_VOLT	0x19
#define DRV260X_AUDIO_HAPTICS_MAX_OUT_VOLT	0xFF

/* Feedback register */
#define DRV260X_FB_REG_ERM_MODE			0x7f
#define DRV260X_FB_REG_LRA_MODE			(1 << 7)

#define DRV260X_BRAKE_FACTOR_MASK	0x1f
#define DRV260X_BRAKE_FACTOR_2X		(1 << 0)
#define DRV260X_BRAKE_FACTOR_3X		(2 << 4)
#define DRV260X_BRAKE_FACTOR_4X		(3 << 4)
#define DRV260X_BRAKE_FACTOR_6X		(4 << 4)
#define DRV260X_BRAKE_FACTOR_8X		(5 << 4)
#define DRV260X_BRAKE_FACTOR_16		(6 << 4)
#define DRV260X_BRAKE_FACTOR_DIS	(7 << 4)

#define DRV260X_LOOP_GAIN_LOW		0xf3
#define DRV260X_LOOP_GAIN_MED		(1 << 2)
#define DRV260X_LOOP_GAIN_HIGH		(2 << 2)
#define DRV260X_LOOP_GAIN_VERY_HIGH	(3 << 2)

#define DRV260X_BEMF_GAIN_0			0xfc
#define DRV260X_BEMF_GAIN_1		(1 << 0)
#define DRV260X_BEMF_GAIN_2		(2 << 0)
#define DRV260X_BEMF_GAIN_3		(3 << 0)

/* Control 1 register */
#define DRV260X_AC_CPLE_EN			(1 << 5)
#define DRV260X_STARTUP_BOOST		(1 << 7)
#define DRV260X_DRIVER_TIME			0x10

/* Control 2 register */

#define DRV260X_IDISS_TIME_45		0
#define DRV260X_IDISS_TIME_75		(1 << 0)
#define DRV260X_IDISS_TIME_150		(1 << 1)
#define DRV260X_IDISS_TIME_225		0x03

#define DRV260X_BLANK_TIME_45	(0 << 2)
#define DRV260X_BLANK_TIME_75	(1 << 2)
#define DRV260X_BLANK_TIME_150	(2 << 2)
#define DRV260X_BLANK_TIME_225	(3 << 2)

#define DRV260X_SAMP_TIME_150	(0 << 4)
#define DRV260X_SAMP_TIME_200	(1 << 4)
#define DRV260X_SAMP_TIME_250	(2 << 4)
#define DRV260X_SAMP_TIME_300	(3 << 4)

#define DRV260X_BRAKE_STABILIZER	(1 << 6)
#define DRV260X_UNIDIR_IN			(0 << 7)
#define DRV260X_BIDIR_IN			(1 << 7)

/* Control 3 Register */
#define DRV260X_LRA_OPEN_LOOP		(1 << 0)
#define DRV260X_ANANLOG_IN			(1 << 1)
#define DRV260X_LRA_DRV_MODE		(1 << 2)
#define DRV260X_RTP_UNSIGNED_DATA	(1 << 3)
#define DRV260X_SUPPLY_COMP_DIS		(1 << 4)
#define DRV260X_ERM_OPEN_LOOP		(1 << 5)
#define DRV260X_NG_THRESH_0			(0 << 6)
#define DRV260X_NG_THRESH_2			(1 << 6)
#define DRV260X_NG_THRESH_4			(2 << 6)
#define DRV260X_NG_THRESH_8			(3 << 6)


/* Control 4 Register */
#define DRV260X_AUTOCAL_TIME_150MS		(0 << 4)
#define DRV260X_AUTOCAL_TIME_250MS		(1 << 4)
#define DRV260X_AUTOCAL_TIME_500MS		(2 << 4)
#define DRV260X_AUTOCAL_TIME_1000MS		(3 << 4)
#define DRV260X_OTP_PROGRAM 			(1)

/**
 * struct drv260x_data -
 * @input_dev - Pointer to the input device
 * @client - Pointer to the I2C client
 * @regmap - Register map of the device
 * @work - Work item used to off load the enable/disable of the vibration
 * @enable_gpio - Pointer to the gpio used for enable/disabling
 * @regulator - Pointer to the regulator for the IC
 * @magnitude - Magnitude of the vibration event
 * @mode - The operating mode of the IC (LRA_NO_CAL, ERM or LRA)
 * @library - The vibration library to be used
 * @rated_voltage - The rated_voltage of the actuator
 * @overdriver_voltage - The over drive voltage of the actuator
**/
struct drv260x_data {
	
	struct i2c_client *client;
	struct regmap *regmap;
	struct work_struct work;
	struct hrtimer hap_timer;
	struct mutex lock;
	struct timed_output_dev timed_dev;
	int max_time_out_len;
	int enable_gpio;
	u8 level;
	u32 enable_gpio_flags;
	struct regulator *regulator;
	u32 magnitude;
	u32 mode;
	u32 state;
	u32 library;
	int rated_voltage;
	int overdrive_voltage;
	struct pwm_device	*pwm_dev;
	struct delayed_work		delay_work;
};
#define PWM_DEFAULT_PERIOD 500;
#define PWM_DUTY_NUM 8
#define PWM_DUTY_CHANGE_TIME_NUM (PWM_DUTY_NUM)
static int pwm_duty[PWM_DUTY_NUM] = {250};
static int pwm_duty_change_time[PWM_DUTY_CHANGE_TIME_NUM] = {2000};
static int pwm_duty_cahnge_position = 0;
static int pwm_period = PWM_DEFAULT_PERIOD;
static struct reg_default drv260x_reg_defs[] = {
	{ DRV260X_STATUS, 0xe0 },
	{ DRV260X_MODE, 0x40 },
	{ DRV260X_RT_PB_IN, 0x00 },
	{ DRV260X_LIB_SEL, 0x00 },
	{ DRV260X_WV_SEQ_1, 0x01 },
	{ DRV260X_WV_SEQ_2, 0x00 },
	{ DRV260X_WV_SEQ_3, 0x00 },
	{ DRV260X_WV_SEQ_4, 0x00 },
	{ DRV260X_WV_SEQ_5, 0x00 },
	{ DRV260X_WV_SEQ_6, 0x00 },
	{ DRV260X_WV_SEQ_7, 0x00 },
	{ DRV260X_WV_SEQ_8, 0x00 },
	{ DRV260X_GO, 0x00 },
	{ DRV260X_OVERDRIVE_OFF, 0x00 },
	{ DRV260X_SUSTAIN_P_OFF, 0x00 },
	{ DRV260X_SUSTAIN_N_OFF, 0x00 },
	{ DRV260X_BRAKE_OFF, 0x00 },
	{ DRV260X_A_TO_V_CTRL, 0x05 },
	{ DRV260X_A_TO_V_MIN_INPUT, 0x19 },
	{ DRV260X_A_TO_V_MAX_INPUT, 0xff },
	{ DRV260X_A_TO_V_MIN_OUT, 0x19 },
	{ DRV260X_A_TO_V_MAX_OUT, 0xff },
	{ DRV260X_RATED_VOLT, 0x3e },
	{ DRV260X_OD_CLAMP_VOLT, 0x8c },
	{ DRV260X_CAL_COMP, 0x0c },
	{ DRV260X_CAL_BACK_EMF, 0x6c },
	{ DRV260X_FEEDBACK_CTRL, 0x36 },
	{ DRV260X_CTRL1, 0x93 },
	{ DRV260X_CTRL2, 0xfa },
	{ DRV260X_CTRL3, 0xa0 },
	{ DRV260X_CTRL4, 0x20 },
	{ DRV260X_CTRL5, 0x80 },
	{ DRV260X_LRA_LOOP_PERIOD, 0x33 },
	{ DRV260X_VBAT_MON, 0x00 },
	{ DRV260X_LRA_RES_PERIOD, 0x00 },
};

#define DRV260X_DEF_RATED_VOLT		0x51
#define DRV260X_DEF_OD_CLAMP_VOLT	0x81
#define DEFAULT_VIBRATION_LEVEL		0x60
#define MAX_TIME_OUT_LEN		15000

#define DRV260X_CAL_COMP_V			0x0B
#define DRV260X_CAL_BACK_EMF_V		0x0C
#define DRV260X_FEEDBACK_CTRL_V		0xB7


static int vib_value = 0;



/**
 * Rated and Overdriver Voltages:
 * Calculated using the formula r = v * 255 / 5.6
 * where r is what will be written to the register
 * and v is the rated or overdriver voltage of the actuator
 **/
static int drv260x_calculate_voltage(unsigned int voltage)
{
	return (voltage * 255 / 5600);
}

static void enable_vib(struct drv260x_data *haptics)
{
	int error;
	int ret;

	if (haptics->state) {
		gpio_direction_output(haptics->enable_gpio, 1);

		/* Data sheet says to wait 250us before trying to communicate */

		error = regmap_write(haptics->regmap,
				DRV260X_MODE, DRV260X_RT_PLAYBACK);

		mdelay(10);
		if (error) {
			dev_err(&haptics->client->dev,
					"Failed to write set mode: %d\n", error);
			return;
		} else {
			error = regmap_write(haptics->regmap,
					DRV260X_RT_PB_IN, haptics->level);
			if (error) {
				dev_err(&haptics->client->dev,
						"Failed to set magnitude: %d\n", error);
				return;
			}
		}

		pr_info("Vib timer start\n");
		ret = hrtimer_start(&haptics->hap_timer,
				ktime_set(vib_value / 1000, (vib_value % 1000) * 1000000),
				HRTIMER_MODE_REL);
		if (ret != 0) {
			dev_err(&haptics->client->dev, "Start hrtimer falild and ret is :%d\n", ret);
		}
	}
}

/* Just for disabel vib */
static void drv260x_worker(struct work_struct *work)
{
	struct drv260x_data *haptics = container_of(work, struct drv260x_data, work);
	int error;

	if (haptics->state) {
		gpio_direction_output(haptics->enable_gpio, 1);

		/* Data sheet says to wait 250us before trying to communicate */

		error = regmap_write(haptics->regmap,
				     DRV260X_MODE, DRV260X_RT_PLAYBACK);
		mdelay(10);

		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write set mode: %d\n", error);
		} else {
			error = regmap_write(haptics->regmap,
					     DRV260X_RT_PB_IN, DEFAULT_VIBRATION_LEVEL);
			if (error)
				dev_err(&haptics->client->dev,
					"Failed to set magnitude: %d\n", error);
		}
	} else {
		error = regmap_update_bits(haptics->regmap,
			 DRV260X_MODE,
			 DRV260X_STANDBY_MASK,
			 DRV260X_STANDBY);
		mdelay(10);
		if (error) {
			dev_err(&haptics->client->dev, "Failed to set standby mode\n");
		}

		gpio_direction_output(haptics->enable_gpio, 1);
	}
}

/* hrtimer function handler.
 * it's a atomic operation, can't be interrupt.
 */
static enum hrtimer_restart drv260x_hap_timer(struct hrtimer *timer)
{
	struct drv260x_data *hap = container_of(timer, struct drv260x_data,
							 hap_timer);

	pr_info("vib timer handler\n");
	hap->state = 0;
	schedule_work(&hap->work);
	return HRTIMER_NORESTART;
}

/* get time api to know the remaining time */
static int drv260x_hap_get_time(struct timed_output_dev *dev)
{
	struct drv260x_data *hap = container_of(dev, struct drv260x_data,
							 timed_dev);

	if (hrtimer_active(&hap->hap_timer)) {
		ktime_t r = hrtimer_get_remaining(&hap->hap_timer);
		return (int)ktime_to_us(r);
	} else {
		return 0;
	}
}

/* enable interface from timed output class */
static void drv260x_hap_enable(struct timed_output_dev *dev, int value)
{
	struct drv260x_data *hap = container_of(dev, struct drv260x_data,
					 timed_dev);

	mutex_lock(&hap->lock);
	hrtimer_cancel(&hap->hap_timer);

	if (value == 0) {
		if (hap->state == 0) {
			mutex_unlock(&hap->lock);
			return;
		} else {
			hap->state = 0;
			mutex_unlock(&hap->lock);
			schedule_work(&hap->work);
			return;
		}
	} else {
		vib_value = (value > hap->max_time_out_len?
				 hap->max_time_out_len: value);
		hap->state = 1;
		enable_vib(hap);
	}

	mutex_unlock(&hap->lock);
}

static ssize_t drv260x_play_by_id_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	return 0;
}

static ssize_t drv260x_play_by_id_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *hap = container_of(timed_dev, struct drv260x_data,
					 timed_dev);
	int i = 0;
	int error;
	int sqe[8] = {0};
	int num = 0;
	gpio_direction_output(hap->enable_gpio, 1);
	num = sscanf(buf, "%d %d %d %d %d %d %d %d",
		&sqe[0], &sqe[1], &sqe[2], &sqe[3], &sqe[4], &sqe[5], &sqe[6], &sqe[7]);
	pr_err("Got id is for dev :%s and count is:%d and buf is %s\n",
		hap->timed_dev.name, num, buf);
	for(i = 0; i < num ;i++)
		pr_err("Data %d is %d\n",i,sqe[i]);
	error = regmap_write(hap->regmap,
						 DRV260X_MODE, DRV260X_INTERNAL_TRIGGER);
	mdelay(10);
	if (error) {
		dev_err(&hap->client->dev,
			"Failed to write set mode: %d\n", error);
		goto end;
	}
	for(i = 0; i < num ;i++) {
		error = regmap_write(hap->regmap,DRV260X_WV_SEQ_1 + i, sqe[i]);
		if (error) {
			dev_err(&hap->client->dev,
					"Failed to set SEQ: %d\n", error);
			goto end;
		}
	}
	error = regmap_write(hap->regmap, DRV260X_GO, DRV260X_GO_BIT);
	if (error) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			error);
		goto end;
	}
	//gpio_direction_output(hap->enable_gpio, 0);

	return count;
end:
	dev_err(&hap->client->dev,"Failed to paly by id\n");
	return count;
}

static const struct reg_default drv260x_lra_pwm_regs[] = {
	{ DRV260X_MODE, DRV260X_PWM_ANALOG_IN },
	{ DRV260X_A_TO_V_CTRL, DRV260X_AUDIO_HAPTICS_PEAK_20MS | DRV260X_AUDIO_HAPTICS_FILTER_125HZ},
	{ DRV260X_A_TO_V_MIN_INPUT, DRV260X_AUDIO_HAPTICS_MIN_IN_VOLT },
	{ DRV260X_A_TO_V_MAX_INPUT, DRV260X_AUDIO_HAPTICS_MAX_IN_VOLT },
	{ DRV260X_A_TO_V_MIN_OUT, DRV260X_AUDIO_HAPTICS_MIN_OUT_VOLT },
	{ DRV260X_A_TO_V_MAX_OUT, DRV260X_AUDIO_HAPTICS_MAX_OUT_VOLT },
	{ DRV260X_CTRL1, DRV260X_STARTUP_BOOST | DRV260X_AC_CPLE_EN |
		DRV260X_DRIVER_TIME},
	{ DRV260X_CTRL2, DRV260X_BIDIR_IN | DRV260X_BRAKE_STABILIZER |
		DRV260X_SAMP_TIME_300 | DRV260X_BLANK_TIME_75 | DRV260X_IDISS_TIME_75},
	{ DRV260X_CTRL3, DRV260X_NG_THRESH_4 | DRV260X_ERM_OPEN_LOOP},
	{ DRV260X_MODE, DRV260X_PWM_ANALOG_IN },

};

static const struct reg_default drv260x_lra_audio_to_viber_regs[] = {
	{ DRV260X_MODE, DRV260X_AUDIOHAPTIC },
	{ DRV260X_A_TO_V_CTRL, DRV260X_AUDIO_HAPTICS_PEAK_20MS | DRV260X_AUDIO_HAPTICS_FILTER_125HZ},
	{ DRV260X_A_TO_V_MIN_INPUT, DRV260X_AUDIO_HAPTICS_MIN_IN_VOLT },
	{ DRV260X_A_TO_V_MAX_INPUT, DRV260X_AUDIO_HAPTICS_MAX_IN_VOLT },
	{ DRV260X_A_TO_V_MIN_OUT, DRV260X_AUDIO_HAPTICS_MIN_OUT_VOLT },
	{ DRV260X_A_TO_V_MAX_OUT, DRV260X_AUDIO_HAPTICS_MAX_OUT_VOLT },
	{ DRV260X_CTRL1, DRV260X_STARTUP_BOOST | DRV260X_AC_CPLE_EN |
		DRV260X_DRIVER_TIME},
	{ DRV260X_CTRL2, DRV260X_BIDIR_IN | DRV260X_BRAKE_STABILIZER |
		DRV260X_SAMP_TIME_300 | DRV260X_BLANK_TIME_75 | DRV260X_IDISS_TIME_75},
	{ DRV260X_CTRL3, DRV260X_NG_THRESH_4 | DRV260X_ANANLOG_IN},
	{ DRV260X_MODE, DRV260X_AUDIOHAPTIC },

};

static const struct reg_default drv260x_lra_cal_regs[] = {
	{ DRV260X_FEEDBACK_CTRL, DRV260X_FB_REG_LRA_MODE | DRV260X_BRAKE_FACTOR_4X |
		DRV260X_LOOP_GAIN_MED | DRV260X_BEMF_GAIN_2},
	{ DRV260X_CTRL1, DRV260X_STARTUP_BOOST | DRV260X_AC_CPLE_EN |
		DRV260X_DRIVER_TIME},
	{ DRV260X_CTRL2, DRV260X_BIDIR_IN | DRV260X_BRAKE_STABILIZER |
		DRV260X_SAMP_TIME_300 | DRV260X_BLANK_TIME_75 | DRV260X_IDISS_TIME_75},
	{ DRV260X_CTRL3, DRV260X_NG_THRESH_2},
	{ DRV260X_MODE, DRV260X_AUTO_CAL },
	{ DRV260X_CTRL4, DRV260X_AUTOCAL_TIME_500MS},
	{ DRV260X_GO, DRV260X_GO_BIT},
};

static const struct reg_default drv260x_lra_init_regs[] = {
	{ DRV260X_FEEDBACK_CTRL, DRV260X_FB_REG_LRA_MODE | DRV260X_BRAKE_FACTOR_4X |
		DRV260X_LOOP_GAIN_MED | DRV260X_BEMF_GAIN_2},
	{ DRV260X_CTRL1, DRV260X_STARTUP_BOOST | DRV260X_AC_CPLE_EN |
		DRV260X_DRIVER_TIME},
	{ DRV260X_CTRL2, DRV260X_BIDIR_IN | DRV260X_BRAKE_STABILIZER |
		DRV260X_SAMP_TIME_300 | DRV260X_BLANK_TIME_75 | DRV260X_IDISS_TIME_75},
	{ DRV260X_CTRL3, DRV260X_NG_THRESH_2},
	{ DRV260X_MODE, DRV260X_STANDBY},
};

static const struct reg_default drv260x_erm_cal_regs[] = {
	{ DRV260X_MODE, DRV260X_AUTO_CAL },
	{ DRV260X_A_TO_V_MIN_INPUT, DRV260X_AUDIO_HAPTICS_MIN_IN_VOLT },
	{ DRV260X_A_TO_V_MAX_INPUT, DRV260X_AUDIO_HAPTICS_MAX_IN_VOLT },
	{ DRV260X_A_TO_V_MIN_OUT, DRV260X_AUDIO_HAPTICS_MIN_OUT_VOLT },
	{ DRV260X_A_TO_V_MAX_OUT, DRV260X_AUDIO_HAPTICS_MAX_OUT_VOLT },
	{ DRV260X_FEEDBACK_CTRL, DRV260X_BRAKE_FACTOR_3X |
		DRV260X_LOOP_GAIN_MED | DRV260X_BEMF_GAIN_2 },
	{ DRV260X_CTRL1, DRV260X_STARTUP_BOOST },
	{ DRV260X_CTRL2, DRV260X_SAMP_TIME_250 | DRV260X_BLANK_TIME_75 |
		DRV260X_IDISS_TIME_75 },
	{ DRV260X_CTRL3, DRV260X_NG_THRESH_2 | DRV260X_ERM_OPEN_LOOP },
	{ DRV260X_CTRL4, DRV260X_AUTOCAL_TIME_500MS },
};

static int drv260x_init(struct drv260x_data *haptics)
{
	int error;
	//unsigned int cal_buf;

	error = regmap_write(haptics->regmap,
			     DRV260X_RATED_VOLT, haptics->rated_voltage);
	if (error) {
		dev_err(&haptics->client->dev,
			"Failed to write DRV260X_RATED_VOLT register: %d\n",
			error);
		return error;
	}

	error = regmap_write(haptics->regmap,
			     DRV260X_OD_CLAMP_VOLT, haptics->overdrive_voltage);
	if (error) {
		dev_err(&haptics->client->dev,
			"Failed to write DRV260X_OD_CLAMP_VOLT register: %d\n",
			error);
		return error;
	}

	switch (haptics->mode) {
	case DRV260X_LRA_MODE:
		error = regmap_register_patch(haptics->regmap,
					      drv260x_lra_init_regs,
					      ARRAY_SIZE(drv260x_lra_init_regs));
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write LRA calibration registers: %d\n",
				error);
			return error;
		}

		break;

	case DRV260X_ERM_MODE:
		error = regmap_register_patch(haptics->regmap,
					      drv260x_erm_cal_regs,
					      ARRAY_SIZE(drv260x_erm_cal_regs));
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write ERM calibration registers: %d\n",
				error);
			return error;
		}

		error = regmap_update_bits(haptics->regmap, DRV260X_LIB_SEL,
					   DRV260X_LIB_SEL_MASK,
					   haptics->library);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write DRV260X_LIB_SEL register: %d\n",
				error);
			return error;
		}

		break;

	default:
		error = regmap_register_patch(haptics->regmap,
					      drv260x_lra_init_regs,
					      ARRAY_SIZE(drv260x_lra_init_regs));
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write LRA init registers: %d\n",
				error);
			return error;
		}

		error = regmap_update_bits(haptics->regmap, DRV260X_LIB_SEL,
					   DRV260X_LIB_SEL_MASK,
					   haptics->library);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write DRV260X_LIB_SEL register: %d\n",
				error);
			return error;
		}

		/* No need to set GO bit here */
		return 0;
	}
/*
	error = regmap_write(haptics->regmap, DRV260X_GO, DRV260X_GO_BIT);
	if (error) {
		dev_err(&haptics->client->dev,
			"Failed to write GO register: %d\n",
			error);
		return error;
	}

	do {
		error = regmap_read(haptics->regmap, DRV260X_GO, &cal_buf);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to read GO register: %d\n",
				error);
			return error;
		}
	} while (cal_buf == DRV260X_GO_BIT);
*/
	return 0;
}

static const struct regmap_config drv260x_regmap_config = {
	.reg_bits = 8,
	.val_bits = 8,

	.max_register = DRV260X_MAX_REG,
	.reg_defaults = drv260x_reg_defs,
	.num_reg_defaults = ARRAY_SIZE(drv260x_reg_defs),
	.cache_type = REGCACHE_NONE,
};

#ifdef CONFIG_OF
static int drv260x_parse_dt(struct device *dev,
			    struct drv260x_data *haptics)
{
	struct device_node *np = dev->of_node;
	unsigned int voltage;
	int error;

	dev_info(dev, "%s: drv260x parse dt\n", __func__);

	error = of_property_read_u32(np, "mode", &haptics->mode);
	if (error) {
		dev_err(dev, "%s: No entry for mode\n", __func__);
		return error;
	}

	error = of_property_read_u32(np, "library-sel", &haptics->library);
	if (error) {
		dev_err(dev, "%s: No entry for library selection\n",
			__func__);
		return error;
	}

	error = of_property_read_u32(np, "vib-rated-mv", &voltage);
	if (!error)
		haptics->rated_voltage = drv260x_calculate_voltage(voltage);


	error = of_property_read_u32(np, "vib-overdrive-mv", &voltage);
	if (!error)
		haptics->overdrive_voltage = drv260x_calculate_voltage(voltage);

	haptics->enable_gpio = of_get_named_gpio_flags(np, "haptics,enable-gpio",
			    0, &haptics->enable_gpio_flags);
	haptics->pwm_dev = of_pwm_get(np, NULL);
	if (!haptics->pwm_dev) {
		dev_err(dev, "%s: get  pwm faild.\n",
			__func__);
		goto faile;
	}
	return 0;
faile:
	return -1;
}
#else
static inline int drv260x_parse_dt(struct device *dev,
				   struct drv260x_data *haptics)
{
	dev_err(dev, "no platform data defined\n");

	return -EINVAL;
}
#endif

static ssize_t drv260x_auto_calibration_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *hap = container_of(timed_dev, struct drv260x_data,
					timed_dev);
//	int cal_value = 0;
	int error = 0;
	int acalcomp = 0;
	int acalbemf = 0;
	int bemfgain = 0;

	gpio_direction_output(hap->enable_gpio, 1);
	mdelay(10);

	error = regmap_read(hap->regmap, DRV260X_CAL_COMP, &acalcomp);
	if (error) {
		dev_err(&hap->client->dev,
				"Failed to read calibration value: %d\n", error);
	}
	error = regmap_read(hap->regmap, DRV260X_CAL_BACK_EMF, &acalbemf);
	if (error) {
		dev_err(&hap->client->dev,
				"Failed to read calibration value: %d\n", error);
	}
	error = regmap_read(hap->regmap, DRV260X_FEEDBACK_CTRL, &bemfgain);
	if (error) {
		dev_err(&hap->client->dev,
				"Failed to read calibration value: %d\n", error);
	}
	gpio_direction_output(hap->enable_gpio, 0);

	return sprintf(buf, "%x %x %x\n", acalcomp, acalbemf, bemfgain);
}

static int drv260x_set_calibration(struct drv260x_data *hap,int acalcomp,int acalbemf,int bemfgain)
{
	int ret = 0;
	gpio_direction_output(hap->enable_gpio, 1);
	mdelay(10);
	ret = regmap_write(hap->regmap, DRV260X_CAL_COMP, acalcomp);
	if (ret) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			ret);
	}
	ret = regmap_write(hap->regmap, DRV260X_CAL_BACK_EMF, acalbemf);
	if (ret) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			ret);
	}
	ret = regmap_write(hap->regmap, DRV260X_FEEDBACK_CTRL, bemfgain);
	if (ret) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			ret);
	}
	gpio_direction_output(hap->enable_gpio, 0);
	return ret;
}
static ssize_t drv260x_auto_calibration_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *haptics = container_of(timed_dev, struct drv260x_data,
					timed_dev);
	int error = 0;
	int enable = 0;
	int result = 0;
//	int i = 0;

	sscanf(buf, "%d", &enable);

	dev_err(&haptics->client->dev,"enbale vlaue = %d\n",enable);
	if (enable) {
		dev_err(&haptics->client->dev,"Start calibration!\n");
		gpio_direction_output(haptics->enable_gpio, 1);
		mdelay(100);
		error = regmap_register_patch(haptics->regmap,
					drv260x_lra_cal_regs,
					ARRAY_SIZE(drv260x_lra_cal_regs));
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write LRA calibration registers: %d\n",
				error);
			gpio_direction_output(haptics->enable_gpio, 1);
			return error;
		}
/*		for(i = 0; i < ARRAY_SIZE(drv260x_lra_cal_regs); i++) {
			regmap_write(haptics->regmap,drv260x_lra_cal_regs[i].reg, drv260x_lra_cal_regs[i].def);
		} */
		mdelay(1800);
		error = regmap_read(haptics->regmap, DRV260X_STATUS, &result);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to read calibration result value: %d\n", error);
		} else {
			if(result & 0x08){
				dev_err(&haptics->client->dev,
					"Failed calibration and  result is: %d\n", result);
				drv260x_set_calibration(haptics,0xff,0xff,0xff);
			}
		}
		gpio_direction_output(haptics->enable_gpio, 1);
		dev_err(&haptics->client->dev, "End calibration!\n");
	}
	return count;

}

static ssize_t drv260x_audio_to_vib_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	size_t count = 0;
	return count;
}

static ssize_t drv260x_audio_to_vib_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *haptics = container_of(timed_dev, struct drv260x_data,
					timed_dev);
	int error = 0;
	int enable = 0;

	sscanf(buf, "%d", &enable);

	dev_err(&haptics->client->dev,"enbale vlaue = %d\n",enable);
	if (enable) {
		dev_err(&haptics->client->dev,"Start calibration!\n");
		error = gpio_direction_output(haptics->enable_gpio, 1);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to set enbale gpio status: %d\n",
				error);
		}
		error = regmap_register_patch(haptics->regmap,
					drv260x_lra_audio_to_viber_regs,
					ARRAY_SIZE(drv260x_lra_audio_to_viber_regs));
		mdelay(10);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write audio_to_viber registers: %d\n",
				error);
			error = gpio_direction_output(haptics->enable_gpio, 1);
			if (error) {
				dev_err(&haptics->client->dev,
					"Failed to set enbale gpio status: %d\n",
					error);
			}
			return error;
		}
	} else {
		error = gpio_direction_output(haptics->enable_gpio, 1);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to set enbale gpio status: %d\n",
				error);
		}
	}
	return count;

}


static ssize_t drv260x_pwm_vib_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	size_t count = 0;
	return count;
}

static ssize_t drv260x_pwm_vib_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *haptics = container_of(timed_dev, struct drv260x_data,
					timed_dev);
	int error = 0;
	int cmd = 0;
	sscanf(buf, "%d", &cmd);

	dev_err(&haptics->client->dev,"cmd vlaue = %d\n",cmd);
	if (cmd == 1) {
		dev_err(&haptics->client->dev,"Start calibration!\n");
		error = gpio_direction_output(haptics->enable_gpio, 1);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to set enbale gpio status: %d\n",
				error);
		}
		error = regmap_register_patch(haptics->regmap,
					drv260x_lra_pwm_regs,
					ARRAY_SIZE(drv260x_lra_pwm_regs));
		mdelay(10);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to write audio_to_viber registers: %d\n",
				error);
			error = gpio_direction_output(haptics->enable_gpio, 1);
			if (error) {
				dev_err(&haptics->client->dev,
					"Failed to set enbale gpio status: %d\n",
					error);
			}
			return error;
		}
		if(pwm_duty_cahnge_position == 0)
			schedule_delayed_work(&haptics->delay_work, 0);
		else
			dev_err(&haptics->client->dev,
				"The pwm vib has been enabe and please wiat it over\n");
	} else if(cmd == 0){
		error = gpio_direction_output(haptics->enable_gpio, 1);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to set enbale gpio status: %d\n",
				error);
		}
		pwm_disable(haptics->pwm_dev);
	} else if(cmd == 2) {
		buf++;
		sscanf(buf, "%d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d",
			&pwm_period,
			&pwm_duty[0], &pwm_duty_change_time[0], &pwm_duty[1], &pwm_duty_change_time[1],
			&pwm_duty[2], &pwm_duty_change_time[2], &pwm_duty[3], &pwm_duty_change_time[3],
			&pwm_duty[4], &pwm_duty_change_time[4], &pwm_duty[5], &pwm_duty_change_time[5],
			&pwm_duty[6], &pwm_duty_change_time[6], &pwm_duty[7], &pwm_duty_change_time[7]);
		printk("period is : %d \n config is :\n %d %d \n %d %d \n %d %d \n %d %d \n %d %d \n %d %d \n %d %d \n %d %d\n",
			pwm_period,
			pwm_duty[0], pwm_duty_change_time[0], pwm_duty[1], pwm_duty_change_time[1],
			pwm_duty[2], pwm_duty_change_time[2], pwm_duty[3], pwm_duty_change_time[3],
			pwm_duty[4], pwm_duty_change_time[4], pwm_duty[5], pwm_duty_change_time[5],
			pwm_duty[6], pwm_duty_change_time[6], pwm_duty[7], pwm_duty_change_time[7]);
	}
	return count;

}


static ssize_t drv260x_calibration_value_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	size_t count = 0;
	return count;
}

static ssize_t drv260x_set_calibration_value_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *hap = container_of(timed_dev, struct drv260x_data,
					timed_dev);
	int acalcomp = 0;
	int acalbemf = 0;
	int bemfgain = 0;
	int num = 0;
	int error = 0;

	gpio_direction_output(hap->enable_gpio, 1);
	mdelay(10);
	num = sscanf(buf, "%d %d %d", &acalcomp, &acalbemf, &bemfgain);

	error = regmap_write(hap->regmap, DRV260X_CAL_COMP, acalcomp);
	if (error) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			error);
	}
	error = regmap_write(hap->regmap, DRV260X_CAL_BACK_EMF, acalbemf);
	if (error) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			error);
	}
	error = regmap_write(hap->regmap, DRV260X_FEEDBACK_CTRL, bemfgain);
	if (error) {
		dev_err(&hap->client->dev,
			"Failed to write GO register: %d\n",
			error);
	}
	gpio_direction_output(hap->enable_gpio, 0);
	return count;
}
static ssize_t drv260x_enable_with_level_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	size_t count = 0;
	return count;
}

static ssize_t drv260x_enable_with_level_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *hap = container_of(timed_dev, struct drv260x_data,
					timed_dev);
	int time_len = 0;
	int level = 0;
	sscanf(buf, "%d %d", &time_len, &level);
	dev_err(&hap->client->dev,
			"get time is : %d and get level is : %d\n",
			time_len ,level);
	hap->level = (u8)level;
	drv260x_hap_enable(timed_dev,time_len);
	return count;
}
static ssize_t drv260x_reg_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	size_t count = 0;
	return count;
}

static ssize_t drv260x_reg_store(struct device *dev,
		struct device_attribute *attr, const char *buf, size_t count)
{
	struct timed_output_dev *timed_dev = dev_get_drvdata(dev);
	struct drv260x_data *hap = container_of(timed_dev, struct drv260x_data,
					timed_dev);
	int value;
	sscanf(buf, "%d", &value);
	if(value == 0){
		gpio_direction_output(hap->enable_gpio, 1);
		dev_err(&hap->client->dev,"Start motor reg RW.\n");
		mdelay(10);
	} else {
		gpio_direction_output(hap->enable_gpio, 0);
		dev_err(&hap->client->dev,"Stop motor reg RW.\n");
	}
	return count;
}

/* sysfs attributes */
static struct device_attribute drv260x_attrs[] = {
	__ATTR(paly_by_id, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_play_by_id_show,
			drv260x_play_by_id_store),
	__ATTR(auto_calibration, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_auto_calibration_show,
			drv260x_auto_calibration_store),
	__ATTR(set_calibration_value, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_calibration_value_show,
			drv260x_set_calibration_value_store),
	__ATTR(audio_to_vibrator, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_audio_to_vib_show,
			drv260x_audio_to_vib_store),
	__ATTR(enable_with_level, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_enable_with_level_show,
			drv260x_enable_with_level_store),
	__ATTR(vibrator_by_pwm, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_pwm_vib_show,
			drv260x_pwm_vib_store),
	__ATTR(RW_reg, (S_IRUGO | S_IWUSR | S_IWGRP),
			drv260x_reg_show,
			drv260x_reg_store),
};
static int drv260x_check_dev(struct i2c_client *client){
	struct device *dev = &client->dev;
	struct i2c_msg xfer[2];
	int dev_id = 0;
	u8 buf[0];
	int ret;

	buf[0] = 0x00 & 0xff;

	/* Write register */
	xfer[0].addr = client->addr;
	xfer[0].flags = 0;
	xfer[0].len = 1;
	xfer[0].buf = buf;

	/* Read data */
	xfer[1].addr = client->addr;
	xfer[1].flags = I2C_M_RD;
	xfer[1].len = 1;
	xfer[1].buf = (void *)&dev_id;

	ret = i2c_transfer(client->adapter, xfer, ARRAY_SIZE(xfer));
	if (ret != ARRAY_SIZE(xfer)) {
		dev_err(dev, "%s: i2c transfer failed (%d)\n",
			__func__, ret);
		return 0;
	}
	dev_err(dev, "%s: read id is  (%d)\n",
			__func__, dev_id);
	if(dev_id == 0)
		return 0;
	else
		return 1;
}
static void drv260x_pwm_vib_work(struct work_struct *work)
{
	struct drv260x_data *haptics;
	int error = 0;
	haptics = container_of(work, struct drv260x_data, delay_work.work);
	pwm_disable(haptics->pwm_dev);
	if(pwm_duty_cahnge_position < PWM_DUTY_CHANGE_TIME_NUM) {
		pr_err("schedule pwm vib at position : %d .\n",pwm_duty_cahnge_position);
		error = pwm_config_us(
				haptics->pwm_dev,
				pwm_duty[pwm_duty_cahnge_position],
				pwm_period);
		if (error < 0) {
			dev_err(&haptics->client->dev, "Failed to " \
				"config pwm :%d and pwm_duty_cahnge_position = %d\n",error,pwm_duty_cahnge_position);
		}
		error = pwm_enable(haptics->pwm_dev);
		if (error < 0) {
			dev_err(&haptics->client->dev, "Failed to " \
				"enable pwm :%d\n",error);
		}
		schedule_delayed_work(&haptics->delay_work, msecs_to_jiffies(pwm_duty_change_time[pwm_duty_cahnge_position]));
		pwm_duty_cahnge_position++;
	} else {
		pr_err("schedule pwm vib end!\n");
		pwm_duty_cahnge_position = 0;
		error = gpio_direction_output(haptics->enable_gpio, 1);
		if (error) {
			dev_err(&haptics->client->dev,
				"Failed to set enbale gpio status: %d\n",
				error);
		}
	}
}

static int drv260x_probe(struct i2c_client *client,
			 const struct i2c_device_id *id)
{
	struct drv260x_data *haptics;
	int error;
	int i = 0;

	dev_info(&client->dev, "Start drv260x driver\n");

	haptics = devm_kzalloc(&client->dev, sizeof(*haptics), GFP_KERNEL);
	if (!haptics) {
		dev_err(&client->dev, "%s:alloc mem faild\n", __func__);
		return -ENOMEM;
	}

	haptics->max_time_out_len = MAX_TIME_OUT_LEN;
	error = drv260x_parse_dt(&client->dev, haptics);
	if (error)
		dev_err(&client->dev,"%s:Prase dt faild\n", __func__);
	haptics->rated_voltage = DRV260X_DEF_RATED_VOLT;
	haptics->overdrive_voltage = DRV260X_DEF_OD_CLAMP_VOLT;
	haptics->level = DEFAULT_VIBRATION_LEVEL;

	if (haptics->mode < DRV260X_LRA_MODE ||
	    haptics->mode > DRV260X_ERM_MODE) {
		dev_err(&client->dev,
			"Vibrator mode is invalid: %i\n",
			haptics->mode);
		return -EINVAL;
	}

	if (haptics->library < DRV260X_LIB_EMPTY ||
	    haptics->library > DRV260X_ERM_LIB_F) {
		dev_err(&client->dev,
			"Library value is invalid: %i\n", haptics->library);
		return -EINVAL;
	}

	if (haptics->mode == DRV260X_LRA_MODE &&
	    haptics->library != DRV260X_LIB_EMPTY &&
	    haptics->library != DRV260X_LIB_LRA) {
		dev_err(&client->dev,
			"LRA Mode with ERM Library mismatch\n");
		return -EINVAL;
	}

	if (haptics->mode == DRV260X_ERM_MODE &&
	    (haptics->library == DRV260X_LIB_EMPTY ||
	     haptics->library == DRV260X_LIB_LRA)) {
		dev_err(&client->dev,
			"ERM Mode with LRA Library mismatch\n");
		return -EINVAL;
	}

	if (gpio_is_valid(haptics->enable_gpio)) {
		/* configure touchscreen irq gpio */
		error = gpio_request(haptics->enable_gpio, "enable_gpio");
		if (error) {
			dev_err(&client->dev, "unable to enable gpio [%d]\n",
				haptics->enable_gpio);
			goto end;
		}
		error = gpio_direction_output(haptics->enable_gpio, 1);
		if (error) {
			dev_err(&client->dev, "unable to set_direction for enable gpio [%d]\n",
				haptics->enable_gpio);
			goto faile;
		}
		mdelay(10);
	}

	mutex_init(&haptics->lock);
	INIT_WORK(&haptics->work, drv260x_worker);

	haptics->regmap = devm_regmap_init_i2c(client, &drv260x_regmap_config);
	if (IS_ERR(haptics->regmap)) {
		error = PTR_ERR(haptics->regmap);
		dev_err(&client->dev, "Failed to allocate register map: %d\n",
			error);
		return error;
	}
	if (drv260x_check_dev(client) == 0){
		//i2c_unregister_device(client);
		dev_err(&client->dev, "%s:check drv2605 faild\n", __func__);
		goto faile;
	}
	error = drv260x_init(haptics);
	if (error) {
		dev_err(&client->dev, "Device init failed: %d\n", error);
		return error;
	}
	error = gpio_direction_output(haptics->enable_gpio, 1);
	if (error) {
		dev_err(&client->dev, "unable to set_direction for enable gpio [%d]\n",
		haptics->enable_gpio);
		goto faile;
	}

	hrtimer_init(&haptics->hap_timer, CLOCK_MONOTONIC, HRTIMER_MODE_REL);
	haptics->hap_timer.function = drv260x_hap_timer;

	haptics->timed_dev.name = "vibrator";
	haptics->timed_dev.get_time = drv260x_hap_get_time;
	haptics->timed_dev.enable = drv260x_hap_enable;
	haptics->client = client;
	i2c_set_clientdata(client, haptics);
	INIT_DEFERRABLE_WORK(&haptics->delay_work, drv260x_pwm_vib_work);

	error = timed_output_dev_register(&haptics->timed_dev);

	if (error < 0) {
		dev_err(&haptics->client->dev, "timed_output registration failed\n");
		goto faile;
	}

	for (i = 0; i < ARRAY_SIZE(drv260x_attrs); i++) {
		error = sysfs_create_file(&haptics->timed_dev.dev->kobj,
				&drv260x_attrs[i].attr);
		if (error < 0) {
			dev_err(&client->dev, "sysfs creation failed\n");
		}
	}

	dev_info(&client->dev, "End of drv260x driver\n");

	return 0;

faile:
	gpio_free(haptics->enable_gpio);
end:
	dev_info(&client->dev, "Probe drv260x fail\n");
	return -1;
}

#ifdef CONFIG_PM_SLEEP
static int drv260x_suspend(struct device *dev)
{
	struct drv260x_data *haptics = dev_get_drvdata(dev);
	int ret = 0;
	mutex_lock(&haptics->lock);
	hrtimer_cancel(&haptics->hap_timer);
	mutex_unlock(&haptics->lock);

	cancel_work_sync(&haptics->work);
	gpio_direction_output(haptics->enable_gpio, 1);
	ret = regmap_update_bits(haptics->regmap,
				 DRV260X_MODE,
				 DRV260X_STANDBY_MASK,
				 DRV260X_STANDBY);
	mdelay(10);
	gpio_direction_output(haptics->enable_gpio, 1);
	if (ret)
		dev_err(dev, "Failed to set vib standby mode\n");
	return ret;
}

static int drv260x_resume(struct device *dev)
{
	struct drv260x_data *haptics = dev_get_drvdata(dev);
	int ret = 0;

	ret = regmap_update_bits(haptics->regmap,
				 DRV260X_MODE,
				 DRV260X_STANDBY_MASK,
				 DRV260X_STANDBY);
	mdelay(10);
	if (ret) {
		dev_err(dev, "Failed to unset vib standby mode\n");
		goto out;
	}

	gpio_direction_output(haptics->enable_gpio, 1);

out:
	return ret;
}
#endif

static SIMPLE_DEV_PM_OPS(drv260x_pm_ops, drv260x_suspend, drv260x_resume);

static const struct i2c_device_id drv260x_id[] = {
	{ "drv2605l", 0 },
	{ }
};
MODULE_DEVICE_TABLE(i2c, drv260x_id);

#ifdef CONFIG_OF
static const struct of_device_id drv260x_of_match[] = {
	{ .compatible = "ti,drv2605l", },
	{ }
};
MODULE_DEVICE_TABLE(of, drv260x_of_match);
#endif

static struct i2c_driver drv260x_driver = {
	.probe		= drv260x_probe,
	.driver		= {
		.name	= "drv260x-haptics",
		.owner	= THIS_MODULE,
		.of_match_table = of_match_ptr(drv260x_of_match),
		.pm	= &drv260x_pm_ops,
	},
	.id_table = drv260x_id,
};
module_i2c_driver(drv260x_driver);

MODULE_ALIAS("platform:drv260x-haptics");
MODULE_DESCRIPTION("TI DRV260x haptics driver");
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Dan Murphy <dmurphy@ti.com>");

