import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';

export const FadeInView = (props) => {
    const [fadeAnim] = useState(new Animated.Value(0))  
    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                duration: 500,
            }
        ).start();
    }, [])
    return (
        <Animated.View                
            style={{
                ...props.style,
                opacity: fadeAnim,      
            }}
        >
            {props.children}
        </Animated.View>
    );
}

export const FadeInText = (props) => {
    const [fadeAnim] = useState(new Animated.Value(0))  
    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                delay: props.delay,
                duration: 500,
            }
        ).start();
    }, [])
    return (
        <Animated.Text             
            style={{
                ...props.style,
                opacity: fadeAnim,        
            }}
        >
            {props.children}
        </Animated.Text>
    );
}
