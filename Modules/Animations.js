import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';

export const FadeInView = (props) => {
    const [fadeAnim] = useState(new Animated.Value(props.initial ? props.initial : 0))  
    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: props.final ? props.final : 1,
                delay: props.delay ? props.delay : 1000,
                duration: props.duration ? props.duration : 2000,
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
    const [fadeAnim] = useState(new Animated.Value(props.initial ? props.initial : 0))  
    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: props.final ? props.final : 1,
                delay: props.delay ? props.delay : 1000,
                duration: props.duration ? props.duration : 500,
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

export const ResizeText = (props) => {
    const [fontSize] = useState(new Animated.Value(props.initial))  
    useEffect(() => {
        Animated.timing(
            fontSize,
            {
                toValue: props.final,
                delay: props.delay,
                duration: props.duration,
            }
        ).start();
    }, [])
    return (
        <Animated.Text             
            style={{
                ...props.style,
                fontSize: fontSize,        
            }}
        >
            {props.children}
        </Animated.Text>
    );
}
