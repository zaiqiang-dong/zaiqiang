#include <iostream>
#include <complex>
#include <iterator>

class Base{
    public:
        int var;

        void(func1)(void){
            std::cout << "this base func 1" << std::endl;
        }

        virtual void(func2)(void){
            std::cout << "this base func 2" << std::endl;
        }
};


class Dev : public Base{
    public:
        int var;

        void(func1)(void){
            std::cout << "this dev func 1" << std::endl;
        }

        virtual void(func2)(void){
            std::cout << "this dev func 2" << std::endl;
        }
};

int main()
{
    Dev d;
    Base *b = &d;
    d.var = 10;
    b->var = 8;

    std::cout << d.var << std::endl;
    std::cout << b->var << std::endl;

    b->func1();
    d.func1();

    b->func2();
    d.func2();
}
